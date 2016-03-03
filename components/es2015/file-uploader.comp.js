/*import * as cssContent from 'stylesheets\main.css';*/
(function(){

    "use strict";
    let template = `
<style>
@import url(https://fonts.googleapis.com/css?family=Roboto);
  .container {
  display: flex;
  font-family: 'Roboto', sans-serif;
  background: #ffffff;
  flex-wrap: nowrap;
  padding:15vw;
  justify-content: flex-start;
  align-items: stretch;
  }

  .componentContainer{
  border: 2px dashed red;
  display:flex;
  width:55vw;
  flex-direction: column;
  text-align: center;

  }
  .rightContainer{
  border: 2px dashed red;
  width:15vw;
  }

.fileSelector {
  color: transparent;
  display:flex;
  align-self:flex-end;
  }

 .hover {
  /**/
  border: 1.5px dashed red;
  display:flex;
  width:55vw;
  flex-direction: column;
  text-align: center;
   }

 p{
    /*align-self: center;*/
 }

 .filePreviewAndProgress
 {
  height:10%;
  width:10%;
  }


 </style>

    <form id="fileUpload" action="fileSaver.js" method="post" enctype="multipart/form-data">
        <div class="container">
            <div class="componentContainer">
                <p class="dropfileshere">Drop files here</p>
                <input type="file" id="fileSelector" class="fileSelector" multiple="multiple" is=”ebfileupload” accepted-file-extensions=”jpg,png” max-file-size=”200000”>
            </div>
             <div class="rightContainer">  </div>
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
            this.$rightContainer = this.shadowRoot.querySelector('.rightContainer');
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
            if (e.type==drop)
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
            //Set the valid file list as a class property
            this.$validFileList=validFilesList;
            this.previewFiles(validFilesList);
            this.upload(validFilesList);
            //this.$fileList.innerHTML=filesInnerHtml;
        }

        previewFiles(validFilesList)
        {
            var rightContainerHTML = "";
            var componentContainerHTML = "";
            for (var i=0; i<validFilesList.length;i++)
            {
                var filePreviewHTML = "";
                var fileInfoHTML ="";
                //Only preview image files
                if(validFilesList[i].type.toLowerCase().indexOf('image')>-1)
                {
                    var reader = new FileReader();
                    this.$currentFile = validFilesList[i];
                    reader.addEventListener("load", this.getImgThumbNail.bind(this));
                    // read the image file as a data URL.
                    reader.readAsDataURL(validFilesList[i]);
                    fileInfoHTML ="<div class = 'fileInfo'>"+ this.$currentFile.name
                                + this.$currentFile.size + "</div>"
                                + "<div class = 'fileStatus' id='" + this.$currentFile.name + "_status'></div>";
                }
                else
                {
                    filePreviewHTML ="<div class = 'file'>"+ validFilesList[i].name + "</div>";
                    fileInfoHTML ="<div class = 'fileInfo'>"+ validFilesList[i].name + "</div>"
                        + this.$currentFile.size + "</div>"
                        + "<div class = 'fileStatus' id='" + validFilesList[i].name + "_status'></div>";
                }
               // console.log(filePreviewHTML);
               // console.log(fileInfoHTML);
                rightContainerHTML += fileInfoHTML;
                componentContainerHTML += filePreviewHTML;
            }
            this.$rightContainer.innerHTML += rightContainerHTML;
            this.$componentContainer.innerHTML += componentContainerHTML;
        }

        //Extract image thumbnail
        getImgThumbNail(e)
        {
            var filePreviewHTML = "";
            filePreviewHTML ="<div class = 'filePreviewAndProgress' id='" + this.$validFileList.shift().name + "_preview'>"
                + "<img id='image' src='" + e.target.result +  "' style='height:100px; width:100px;'/>"
                + "</div>";
            // get loaded data and render thumbnail.
            //this.$imageSrc = e.target.result;
            this.$componentContainer.innerHTML += filePreviewHTML;
        }

        //Uploading files to server
        upload(validFilesList){

            for (var i=0; i<validFilesList.length;i++)
            {
                //Form data object to store a file
                let formData  = new FormData();
                formData.append("file" , validFilesList[i]);
                //XHR to upload the file
                let httpReq=new XMLHttpRequest();
                httpReq.open("POST",this.$fileUpload.action,true);
                httpReq.setRequestHeader("FILENAME",validFilesList[i].name);
                httpReq.send(formData);
            }
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
            return fileSize/1024 <= maxfilesize ? true : false;
        }
        //Validating file type

        checkFileType(allFileExtensions, fileType) {
            let fileExtensions=[];
            fileExtensions = allFileExtensions.split(",");
            return fileExtensions.indexOf(fileType) > -1 ? true : false;
        }
    }

    document.registerElement('file-upload', FileUpload);
})();
