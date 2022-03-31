const audio = document.getElementById('audio');
//importing audio
const Store = require('electron-store')
//importing electron store
const ms = require('ms')
//importing ms
const {shell} = require('electron')
//import the "shell" value from electron
const icon = document.getElementById('fileOpen')
//import icon from html
const url = document.getElementById('url')
//import url from html
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
//ms wait
const downloadBtn = document.getElementById('download-btn')
//download button from html
var YoutubeMp3Downloader = require("youtube-mp3-downloader");
//youtube mp3 downloader
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
//ffmpegPath so yt mp3 downloader would work
var YD = new YoutubeMp3Downloader({
    "ffmpegPath": `${ffmpegPath}`,
    "outputPath": `${__dirname}/songs`,
    "youtubeVideoQuality": "highestaudio",
    "queueParallelism": 2,
    "progressTimeout": 2000,
    "allowWebm": false
});
//creating YD downloader
const play = document.getElementById('play')
const skip = document.getElementById('skip')
const back = document.getElementById('back')
const progress = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const songTitle = document.getElementById('music-title')
const volume = document.getElementById('volume')
//you probably understand this code
play.classList.remove('play')
//remove the "play" class from play button
const store = new Store()
//create a new store client
const fs = require('fs')
//ayo fs nice
let files = store.get('files')
let error = store.get('error')
//get data from database
let i = 0
//song number
function playSong() {
    play.classList.add('play');
    songTitle.innerHTML = files[i].displayName
    play.src = "./images/pause.png"
    audio.play()
}
//play song function
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
//load song function
function backSong() {
    i--
    if(i < 0) {
        i = files.length - 1
    }
    loadSong(files[i].name)
    store.set('songName', files[i].displayName)
}
//going back a song
audio.addEventListener('ended', () => {
    nextSong()
})
//when the audio ended, go to a new one
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}
//progress bar
function pauseSong() {
    play.src = "./images/play.png"
    play.classList.remove('play');
    audio.pause();
}
//pausing the song
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
//play button event listener
back.addEventListener('click', backSong)
//backing the song
skip.addEventListener('click', nextSong)
//skipping the song
audio.addEventListener('timeupdate', (time) => {
    const { duration, currentTime } = time.target
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`
})
//progress bar
volume.addEventListener('change', (e) => {
    audio.volume = e.currentTarget.value / 100;
})
//volume
progressContainer.addEventListener('click', setProgress)
//set progress
var toastLiveExample = document.getElementById('liveToast')
//song bootstrap stuff
async function wait(number) {
    await delay(Number(number))
}
//waiting
async function download(id) {
    YD.download(id);
}
//downloading from yt
const ytDownloadError = document.getElementById('liveToastDownload')
// toast for yt download error
var toastError = new bootstrap.Toast(ytDownloadError)
// bootstrap stuff
function textReplace(haystack, needle, replacement) {
    needle = needle.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
    return haystack.replace(new RegExp(needle, 'g'), replacement);
}
//text replace (thank you androz for this)
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
//downloading yt
var toast = new bootstrap.Toast(toastLiveExample)
const openFile = () => {
    shell.openPath(`${__dirname}/songs`)
}
//open your song files
icon.addEventListener('click', openFile)
//same thing
toast.hide()
//hiding the toast
wait(4000)
//waiting 4000 ms idk why i put this

if(error === true) {
    toast.show()
}
//error discord rpc checker