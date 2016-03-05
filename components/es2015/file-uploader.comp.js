/*import * as cssContent from 'stylesheets\main.css';*/
(function(){

    "use strict";
    let template = `
<style>
@import url(stylesheets/componentDesign.css);

.filePreviewAndProgress
 {
    display:flex;
  }

  section{
  		margin-top:30px;
  		text-align:left;
  	}
  	.noblur{
  	            -webkit-filter: blur(0px);
  	}

  	.blur{

    -webkit-filter: blur(1px);

      	}
 </style>

    <form id="fileUpload" action="fileSaver.js" method="post" enctype="multipart/form-data">

            <div class="componentContainer">
                <p class="dropfileshere">Drop files here </br> or </br> </p>
                <input type="file" id="fileSelector" class="fileSelector" multiple="multiple" is=”ebfileupload” accepted-file-extensions=”jpg,png” max-file-size=”200000”>

                <section id="messageHolder">
                </section>

            </div>


    </form>
    `;

    class FileUpload extends HTMLElement{
        // Fires when an instance of the element is created.
        createdCallback(){
            this.createShadowRoot().innerHTML=template;

            //Grab the elements from the shadow root
            this.$container = this.shadowRoot.querySelector('.container');
            this.$fileSelector = this.shadowRoot.querySelector('.fileSelector');
            this.$componentContainer = this.shadowRoot.querySelector('.componentContainer');
            this.$fileUpload = this.shadowRoot.querySelector('#fileUpload');


            //Event handlers
            //Event handler - File selection
            this.$fileSelector.addEventListener('change', this.filesSelected.bind(this) );

            //File drag n drop
            this.$componentContainer.addEventListener("dragover", this.fileDragHover.bind(this));
            this.$componentContainer.addEventListener("dragleave", this.fileDragHover.bind(this));
            this.$componentContainer.addEventListener("drop", this.filesSelected.bind(this));
            this.$componentContainer.style.display = "block";
        }

        filesSelected(e)
        {
            let validFilesList=[];
            let invalidFilesList=[];
            if (e.type=="drop")
            {
                e.stopPropagation();
                e.preventDefault();
            }
            let f = e.type=='change' ? this.$fileSelector.files : e.dataTransfer.files;
            // process all File objects
            for (var i=0; i<f.length;i++)
            {
                //Checking file attributes
                //TODO: take file attributes from input tag
                // let isValidFileSize = this.checkFileSize(this.getAttribute('max-file-size'), f[i].size);
                let isValidFileSize = this.checkFileSize(this.getAttribute('max-file-size'), f[i].size);
                //Checking file type
                let fileSplits= f[i].name.split('.');
                let fileType =fileSplits[fileSplits.length-1];
                let isValidFileType = this.checkFileType(this.getAttribute('accepted-file-extensions'),fileType);
                if (isValidFileSize && isValidFileType){
                    validFilesList.push(f[i]);
                }
                else
                {
                    invalidFilesList.push(f[i]);
                }
                // filesInnerHtml+="<div class = 'file'>"+ f[i].name + "</div>";
            }
            //Set the valid file list as a class property to be accessed later
            //this.$validFileList=validFilesList;
            this.previewFiles(validFilesList);
            this.upload(validFilesList);
            //this.$fileList.innerHTML=filesInnerHtml;
        }

        previewFiles(validFilesList)
        {
            var localImageList = [];
            var rightContainerHTML = "";
            var componentContainerHTML = "";
            for (var i=0; i<validFilesList.length;i++)
            {
                var filePreviewHTML = "";
                var fileInfoHTML ="";

                //Only preview image files
                if(validFilesList[i].type.toLowerCase().indexOf('image')>-1)
                {
                    //Add the images to the local queue
                    localImageList.push(validFilesList[i]);

                    var reader = new FileReader();

                    //this.$currentFile = validFilesList[i];

                    reader.addEventListener("load", this.getImgThumbNail.bind(this, validFilesList[i]));

                    // read the image file as a data URL.
                    reader.readAsDataURL(validFilesList[i]);

                    /*fileInfoHTML ="<div class = 'fileInfo'>"+ this.$currentFile.name
                     + this.$currentFile.size + "</div>"
                     + "<div class = 'fileStatus' id='" + this.$currentFile.name + "_status'></div>";*/
                }
                else
                {
                    filePreviewHTML =

                        "<div class = 'filePreviewAndProgress' id='" + validFilesList[i].name + "_preview'>"

                        +   "<figure> "
                        +       "<img id='image' src='dist/img/NoPreview.jpg' style='height:100px; width:100px;'/>"
                        +       "<p id='progressText' class='progress'></p>"
                        +       "<progress id='progressBar' class='progress' value='0'></progress>"
                        +   "</figure>"

                        + "<section>" + validFilesList[i].name + "</br>"
                        + "1024 X 768Pixels</br>"
                        + validFilesList[i].size + "MB</br>"

                        + "</section>"

                        + "</div>";

                    /*filePreviewHTML ="<div class = 'file'>"+ validFilesList[i].name + "</div>";
                     fileInfoHTML ="<div class = 'fileInfo'>"+ validFilesList[i].name + "</div>"
                     + this.$currentFile.size + "</div>"
                     + "<div class = 'fileStatus' id='" + validFilesList[i].name + "_status'></div>";*/
                }
                // console.log(filePreviewHTML);
                // console.log(fileInfoHTML);
                //rightContainerHTML += fileInfoHTML;

                componentContainerHTML += filePreviewHTML;
            }
            //this.$rightContainer.innerHTML += rightContainerHTML;
            //console.log (componentContainerHTML);

            this.$fileList = localImageList;
            //console.log (localImageList);
            this.$componentContainer.innerHTML += componentContainerHTML;
        }

        //Extract image thumbnail
        getImgThumbNail(e)
        {
            var imageFIle = Array.prototype.slice.call(arguments)[0];

            var filePreviewHTML = "";
            filePreviewHTML =

                "<div class = 'filePreviewAndProgress' id='" + imageFIle.name + "_preview'>"

                +   "<figure> "
                +       "<img id='image' class='blur' src='" + Array.prototype.slice.call(arguments)[1].target.result +  "' style='height:100px; width:100px;'/>"
                +       "<p id='progressText' class='progress'></p>"
                +       "<progress id='progressBar' class='progress' value='0'></progress>"
                +   "</figure>"

                +   "<section>"
                + imageFIle.name + "</br>"
                + "1024 X 768Pixels</br>"
                + imageFIle.size + "</br>"
                +   "</section>"

                + "</div>";
            this.$componentContainer.innerHTML += filePreviewHTML;
        }

        //Uploading files to server
        upload(validFilesList){

            for (var i=0; i<validFilesList.length;i++)
            {
                //Form data object to store the file
                let formData  = new FormData();
                formData.append("file" , validFilesList[i]);

                //XHR to upload the file
                let httpReq=new XMLHttpRequest();


                //this.$componentContainer.innerHTML="<p>" + validFilesList[i].name + " <progress id='progressing' class='progress' value='0'></progress></p>";
                //this.$componentContainer.innerHTML="<p>" + validFilesList[i].name + " <p id='progressing' class='progress'></p></p>";
                //this.$progress = this.shadowRoot.querySelector('.progress');



                //console.log(validFilesList[i].name + "_preview");
                //console.log(this.$previewDiv);

                //function (this.$previewDiv){

                //}(this.$previewDiv);

                //XHR event listeners
                httpReq.upload.addEventListener("progress", this.progressHandler.bind(this, validFilesList[i]));
                httpReq.upload.addEventListener("load", this.onloadHandler.bind(this, validFilesList[i]));


                httpReq.open("POST",this.$fileUpload.action,true);

                httpReq.setRequestHeader("FILENAME",validFilesList[i].name);

                httpReq.send(formData);
            }
        }

        onloadHandler(e){
            var file = Array.prototype.slice.call(arguments)[0];
            console.log("upload complete");
            this.shadowRoot.getElementById(file.name+"_preview").firstChild.childNodes[1].className="noblur";
        }

        progressHandler(e)
        {
            console.log("Progressing");
            console.log(Array.prototype.slice.call(arguments));
            var file = Array.prototype.slice.call(arguments)[0];
            var event = Array.prototype.slice.call(arguments)[1];

            //this.$previewDiv = this.shadowRoot.querySelector('#' + 'bower-logo.png' + '_preview');

            this.$previewDiv = this.shadowRoot.querySelector('.filePreviewAndProgress');


            // console.log(this.$previewDiv.firstChild);
            console.log(this.shadowRoot.getElementById(file.name+"_preview").firstChild.childNodes[3].innerHTML);

            this.shadowRoot.getElementById(file.name+"_preview").firstChild.childNodes[2].innerHTML =  Math.round((event.loaded/event.total)*100) + "%";

            this.shadowRoot.getElementById(file.name+"_preview").firstChild.childNodes[3].setAttribute('value', e.loaded);
            this.shadowRoot.getElementById(file.name+"_preview").firstChild.childNodes[3].setAttribute('max', e.total);

            console.log(Math.round((event.loaded/event.total)*100) + "%");

            //Set the % value of progress inside the progress bar
            //this.$progress.setAttribute('value', e.loaded);
            //this.$progress.setAttribute('max', e.total);


            //Set the % value of progress inside the label
            //this.innerHTML = Math.round((event.loaded/event.total)*100) + "%";



            //console.log(e.loaded + ":" + e.total);
            // $('#' + progress).attr('value', e.loaded);
            //$('#' + progress).attr('max', e.total);
        }

        fileDragHover(e)
        {
            e.stopPropagation();
            e.preventDefault();
            //console.log (e.type);
            this.$componentContainer.className = (e.type == "dragover" ? "hover" : "componentContainer");
            //this.$filedrag.className = "hover";
        }

        //Validating file size
        checkFileSize(maxfilesize, fileSize) {
            return fileSize <= maxfilesize ? true : false;
        }

        //Validating file type
        checkFileType(allFileExtensions, fileType) {
            let fileExtensions=[];
            fileExtensions = allFileExtensions.toLowerCase().split(",");
            return fileExtensions.indexOf(fileType.toLowerCase()) > -1 ? true : false;
        }
    }

    document.registerElement('file-upload', FileUpload);
})();
