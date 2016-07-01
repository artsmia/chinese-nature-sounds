SHELL := bash

cricket-content.csv: cricket-content.xslx
	j $< | ghead -n -1 > $@

cricket-content.json: cricket-content.csv
	csvjson $< > $@

# Download the audio files, convert swf to mp3
audio: cricket-content.csv
	mkdir -p audio; cd audio; \
	csvcut -c1,4 ../$< | while read line; do \
		name=$$(csvcut -c1 <<<$$line); \
		file=$$(csvcut -c2 <<<$$line); \
		if [[ ! -f $$file ]]; then \
			echo $$file | grep coocan | xargs curl --silent | grep Sound2/korogiSoundPh | head -1 | \
				gsed 's|.*\(.\./.*.swf\).*|\1|; s|\.\.|http://uns.music.coocan.jp|' | \
				xargs curl -o "$$name.swf"; \
			echo $$file | grep xeno-canto | xargs curl --silent | grep contentURL | \
				gsed 's|.*\(http://.*.mp3\).*|\1|' \
				| xargs curl -o "$$name.mp3"; \
			echo $$file | grep 56.com | xargs youtube-dl --extract-audio -o "$$name.%(ext)s"; \
			echo $$file | grep youtube | xargs youtube-dl -f bestaudio -o "$$name.%(ext)s"; \
		fi; \
	done
	cd audio; for swf in audio/*.swf; do \
		ffmpeg -i "$$swf" "$$(echo $$swf | sed 's/swf/mp3/')"; \
		rm -rf "$$swf"; \
	done

images: cricket-content.csv _images
	paste -d '\n' <(csvcut -c1 cricket-content.csv | tail -n+2) _images | while read cricket; do \
		read image; \
		if echo $$image | grep -v html | grep -v '^$$' > /dev/null; then \
			ext=$$(gsed 's/.*\(\..*\)$$/\1/' <<<$$image); \
			file="images/$$cricket$$ext"; \
			[[ -f $$file ]] || curl --silent $$image -o "$$file"; \
		fi; \
	done

deploy:
	webpack
	rsync -avz index.html audio images build/bundle.js css staging:/var/www/crickets/

deploy-marchetti:
	webpack
	rsync -avz index.html marchetti/audio marchetti/images build/bundle.js css staging:/var/www/crickets/marchetti

deploy-soundscapes:
	webpack
	rsync -avz --exclude "*.tif" --exclude="originals/*" index.html soundscapes/audio soundscapes/images build/bundle.js css staging:/var/www/crickets/soundscapes

sass:
	rewatch sass/*.scss -c "sassc -lm sass/chinese-nature-sounds.scss css/chinese-nature-sounds.css"

.PHONY: images audio deploy sass
