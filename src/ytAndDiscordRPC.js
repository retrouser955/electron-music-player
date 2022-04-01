function errorHandler(error) {
    if(error === true) {
        toast.show()
    }
}
function yDevent(YD, files, ytProgressToast, downloadedToast) {
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
        downloadedToast.show()
    });
}
module.exports = {
    errorModule: errorHandler,
    yDevent: yDevent
}