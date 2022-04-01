const audio = document.getElementById('audio');
const Store = require('electron-store')
const ms = require('ms')
const {shell} = require('electron')
const icon = document.getElementById('fileOpen')
const url = document.getElementById('url')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const downloadBtn = document.getElementById('download-btn')
var YoutubeMp3Downloader = require("youtube-mp3-downloader");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": `${ffmpegPath}`,
    "outputPath": `${__dirname}/songs`,
    "youtubeVideoQuality": "highestaudio",
    "queueParallelism": 2,
    "progressTimeout": 2000,
    "allowWebm": false
});
async function wait(number) {
    await delay(Number(number))
}
const play = document.getElementById('play')
const skip = document.getElementById('skip')
const back = document.getElementById('back')
const progress = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const songTitle = document.getElementById('music-title')
const volume = document.getElementById('volume')
play.classList.remove('play')
const store = new Store()
const fs = require('fs')
let files = store.get('files')
let error = store.get('error')
let i = 0
function playSong() {
    play.classList.add('play');
    songTitle.innerHTML = files[i].displayName
    play.src = "./images/pause.png"
    audio.play()
}
function loadSong(song) {
    audio.src = song
    playSong()
}
function nextSong() {
    i++
    if(i > files.length - 1) {
        i = 0
    }
    loadSong(files[i].name)
    store.set('songName', files[i].displayName)
}
function backSong() {
    i--
    if(i < 0) {
        i = files.length - 1
    }
    loadSong(files[i].name)
    store.set('songName', files[i].displayName)
}
audio.addEventListener('ended', () => {
    nextSong()
})
function musicPlay() {
    const isPlaying = play.classList.contains('play');
    if(isPlaying) {
        playSong()
    } else {
        return
    }
}
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}
function pauseSong() {
    play.src = "./images/play.png"
    play.classList.remove('play');
    audio.pause();
}
play.addEventListener('click', () => {
    const isPlaying = play.classList.contains('play')
    const isFirst = play.classList.contains('firstSong')
    if(!isFirst) {
	    loadSong(files[i].name)
	    play.classList.add('firstSong')
        store.set('songName', files[i].displayName)
        store.set('songState', ['Playing', 'play'])
    }
    if(isPlaying) {
        pauseSong()
        store.set('songState', ['Paused', 'pause'])
    } else {
        playSong()
        store.set('songState', ['Playing', 'play'])
    }
})
back.addEventListener('click', backSong)
skip.addEventListener('click', nextSong)
audio.addEventListener('timeupdate', (time) => {
    const { duration, currentTime } = time.target
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`
})
volume.addEventListener('change', (e) => {
    audio.volume = e.currentTarget.value / 100;
})
progressContainer.addEventListener('click', setProgress)
var toastLiveExample = document.getElementById('liveToast')
async function wait(number) {
    await delay(Number(number))
}
async function download(id) {
    YD.download(id);
}
const ytDownloadError = document.getElementById('liveToastDownload')
var toastError = new bootstrap.Toast(ytDownloadError)
function textReplace(haystack, needle, replacement) {
    needle = needle.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
    return haystack.replace(new RegExp(needle, 'g'), replacement);
}
downloadBtn.addEventListener('click', async () => {
    let id;
    if(!String(url.value).toLowerCase().includes('youtube.com')) return toastError.show()
    id = textReplace(url.value, 'youtube.com', '')
    id = textReplace(id, '/', '')
    id = textReplace(id, 'https', '')
    id = textReplace(id, ':', '')
    id = textReplace(id, 'watch?v=', '')
    id = textReplace(id, 'www.', '')
    var ytProgress = document.getElementById('liveToastDownloadProgress')
    var ytProgressToast = new bootstrap.Toast(ytProgress)
    ytProgressToast.show()
    download(id)
    
    YD.on("finished", function(err, data) {
        files = []
        let newFiles = fs.readdirSync(`${__dirname}/songs`).filter(file => file.endsWith('.mp3'))
        for(const songs of newFiles) {
            let songDisplayName;
            songDisplayName = textReplace(songs, '.mp3', '')
            songDisplayName = textReplace(songDisplayName, '_', ' ')
            files.push({
                name: `${__dirname}/songs/${songs}`,
                thumbnail: `${__dirname}/image/record.png`,
                displayName: `${songDisplayName}`
            })
        }
        i = i++
        ytProgressToast.hide()
        wait(5000)
        var downloadedSongToast = document.getElementById('liveToastDownloadSuccess')
        var downloadedToast = new bootstrap.Toast(downloadedSongToast)
        downloadedToast.show()
    });
})
var toast = new bootstrap.Toast(toastLiveExample)
const openFile = () => {
    shell.openPath(`${__dirname}/songs`)
}
icon.addEventListener('click', openFile)
toast.hide()
wait(4000)


if(error === true) {
    toast.show()
}