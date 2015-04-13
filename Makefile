cricket-content.csv: cricket-content.xslx
	j $< | tail -n+1 > $@

# Download the audio files, convert swf to mp3
audio: cricket-content.csv
	mkdir -p audio; cd audio; \
	csvcut -c1,4 ../$< | while read line; do \
		name=$$(csvcut -c1 <<<$$line); \
		file=$$(csvcut -c2 <<<$$line); \
		echo $$file | grep coocan | xargs curl --silent | grep Sound2/korogiSoundPh | head -1 | \
			gsed 's|.*\(.\./.*.swf\).*|\1|; s|\.\.|http://uns.music.coocan.jp|' | \
			xargs curl -o "$$name.swf"; \
		echo $$file | grep xeno-canto | xargs curl --silent | grep contentURL | \
			gsed 's|.*\(http://.*.mp3\).*|\1|' \
			| xargs curl -o "$$name.mp3"; \
		echo $$file | grep 56.com | xargs youtube-dl --extract-audio -o "$$name.%(ext)s"; \
		echo $$file | grep youtube | xargs youtube-dl -f bestaudio -o "$$name.%(ext)s"; \
	done
	for swf in *.swf; do \
		ffmpeg -i "$$swf" "$$(echo $$swf | sed 's/swf/mp3/')"; \
		rm -rf "$$swf"; \
	done

default: cricket-content.csv audio
