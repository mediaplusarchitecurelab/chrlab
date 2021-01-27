export default container => {
    document.getElementById('loading-opencv').innerHTML='Opencv loaded...';
    console.log('b');
    //var video = document.getElementById("videoElement");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia() not supported.");
        return;
    }
     navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                         .then(function(stream) {
                             var video = document.querySelector('videoElement');
                             if ("srcObject" in video) {
                                 video.srcObject = stream;
                             } else {
                                 video.src = window.URL.createObjectURL(stream);
                             }
                             video.onloadedmetadata = function(e) {
                                 video.play();
                             };
                        })
                          .catch(function(err) {
                               console.log(err.name + ": " + err.message);
                           });
    /*
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
        })
        .catch(function (err0r) {
          console.log(video);
        });
    }
    //var src = cv.imread(srcImgEl);
/*
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                     console.log("getUserMedia() not supported.");
                     return;
                }
 
                var btn = document.querySelector('button');
               
                btn.onclick=function(e) {
 
 navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                         .then(function(stream) {
                             var video = document.querySelector('video');
                             if ("srcObject" in video) {
                                 video.srcObject = stream;
                             } else {
                                 video.src = window.URL.createObjectURL(stream);
                             }
                             video.onloadedmetadata = function(e) {
                                 video.play();
                             };
                        })
                          .catch(function(err) {
                               console.log(err.name + ": " + err.message);
                           });
 
                };


    const canvas = createCanvas(document, container);
    const sceneManager = SceneManager(canvas);

    let canvasHalfWidth;
    let canvasHalfHeight;

    bindEventListeners();
    render();

    function createCanvas(document, container) {
        const canvas = document.createElement('canvas');     
        container.appendChild(canvas);
        return canvas;
    }

    function bindEventListeners() {
        window.onresize = resizeCanvas;
        resizeCanvas();	
    }

    function resizeCanvas() {        
        canvas.style.width = '100%';
        canvas.style.height= '100%';
        
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        canvasHalfWidth = Math.round(canvas.offsetWidth/2);
        canvasHalfHeight = Math.round(canvas.offsetHeight/2);

        sceneManager.onWindowResize()
    }

    function render(time) {
        requestAnimationFrame(render);
        sceneManager.update();
    }
    */
}