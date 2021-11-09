export default class{
    #recorder = null;
    video = null;
    constructor(video, btnStart, btnStop) {
        if(!navigator.getDisplayMedia && !navigator.mediaDevices.getDisplayMedia) {
            const error = 'Your browser does NOT support the getDisplayMedia API.';
            document.querySelector('h1').innerHTML = error;

            document.querySelector('video').style.display = 'none';
            document.getElementById('btn-start-recording').style.display = 'none';
            document.getElementById('btn-stop-recording').style.display = 'none';
            throw new Error(error);
        }
        this.video = video;
        this.btnStop = btnStop;
        this.btnStart = btnStart;
        this.btnStop.style.display = 'none';
        this.btnStart.addEventListener('click', (e) => {
            e.target.style.display = 'none';
            this.captureScreen((screen) => {
                this.video.srcObject = screen;

                this.#recorder = RecordRTC(screen, {
                    type: 'video',
                    mimeType: 'video/mp4'
                });

                this.#recorder.startRecording();

                // release screen on stopRecording
                this.#recorder.screen = screen;

                this.btnStop.style.display = 'block';
            });
        })

        this.btnStop.addEventListener('click', (e) => {
            e.target.style.display = 'none';
            this.#recorder.stopRecording(this.stopRecordingCallback.bind(this));
        })

    }
    invokeGetDisplayMedia(success, error) {

        const displayMediaStreamConstraints = {
            video: true,

        };

        if(navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints).then(success).catch(error);
        }
        else {
            navigator.getDisplayMedia(displayMediaStreamConstraints).then(success).catch(error);
        }
    }

    captureScreen(callback) {
        this.invokeGetDisplayMedia((screen) =>{
            this.addStreamStopListener(screen, () => {
                this.btnStop.click();
            });
            callback(screen);
        }, function(error) {
            console.error(error);
            alert('Unable to capture your screen. Please check console logs.\n' + error);
        });
    }

    stopRecordingCallback() {
        this.video.src = this.video.srcObject = null;
        this.video.src = URL.createObjectURL(this.#recorder.getBlob());

        this.#recorder.screen.stop();
        this.#recorder.destroy();
        this.#recorder = null;

        this.btnStart.style.display = 'block';
    }

    addStreamStopListener(stream, callback) {
        stream.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);
        stream.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
        stream.getTracks().forEach(function(track) {
            track.addEventListener('ended', function() {
                callback();
                callback = function() {};
            }, false);
            track.addEventListener('inactive', function() {
                callback();
                callback = function() {};
            }, false);
        });
    }
}
