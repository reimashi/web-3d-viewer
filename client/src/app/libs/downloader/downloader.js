class Downloader {
    /**
     * Download a file on the browser
     * @param {String} url - Url of the file
     * @param {String} filename - Name of the file to be saved
     */
    static download(url, filename) {
        let link = document.createElement('a');

        link.setAttribute('download', filename);
        link.style.display = 'none';

        document.body.appendChild(link);

        console.log("Downloading file", url, "as", filename);

        link.setAttribute('href', url);
        link.click();

        document.body.removeChild(link);
    }
}

export default Downloader;