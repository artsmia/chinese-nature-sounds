renameAudioFiles:
	mv "~/Downloads/Soundscapes draft v1/*" audio/
	rename -X -e 's/ mix .*$$//e' audio/*

moveAndResizeImages:
	vipsthumbnail --size=900 -o %s.jpg images/*
