/**
 * Created by home on 2/27/2016.
 */

/*import * as cssContent from 'stylesheets\main.css';*/
(function(){

    "use strict";
    let template = `
<style>
@import url(https://fonts.googleapis.com/css?family=Roboto);
.container {
  display: flex;
  align-self: center;
  font-family: 'Roboto', sans-serif;
  /*padding:15%;*/
  /*max-width:100%;*/
  background: #ffffff;
  flex-wrap: wrap;
  margin: 100px;
  height:500px;
  }

.container .fileUpload {

  width: 100px;
  align-self: center;
  color: transparent;
  padding-top:25%;
  }

 .fileList {
  display:flex;
  flex-direction:column;
  text-align: center;
  height: 98%;
  width:30%;
  /*min-width: 15vh;*/
 }

 .file {
  display:flex;
  justify-content: center;
  align-items:center;
  background:#f7c6d5;
  height: 15%;
  width: 80%;
  color:black;
  margin-top:5px;
 }

.container .filedrag {
  display:flex;
  flex-direction:column;
  justify-content: center;
  align-items:center;
  border: 2px dashed darkgrey;
  height: 98%;
  /*min-width: 55vh;*/
  width:55%;
  text-align: center;
  margin:5px;
  }

.hover {
  border: 1.5px dashed #555;
  height: 98%;
  width: 45%;
  background:#fff;
  margin: 5px;
  text-align: center;
  align-items:center;
   }

 section{
 padding-top: 10%;

 }
 </style>

        <div class="container" >
                <div class="filedrag">

                   <input type="file" id="myFile" class="fileUpload" multiple="multiple">
                   <section> OR </section>
                    <section> Drop files here </section>

                </div>
	          <div class="fileList">     </div>
        </div>
    `;

    class FileUpload extends HTMLElement{


       // var that;
        // Fires when an instance of the element is created.
        createdCallback(){
            this.createShadowRoot().innerHTML=template;

            //Grab the elements from the shadow root
            this.$container = this.shadowRoot.querySelector('.container');
            this.$fileUpload = this.shadowRoot.querySelector('.fileUpload');
            this.$filedrag = this.shadowRoot.querySelector('.filedrag');
            this.$fileList = this.shadowRoot.querySelector('.fileList');

            //Event handlers
            //Event handler - File selection
            this.$fileUpload.addEventListener('change', this.filesSelected.bind(this) );
            //File drag n drop
            this.$filedrag.addEventListener("dragover", this.fileDragHover.bind(this));
            this.$filedrag.addEventListener("dragleave", this.fileDragHover.bind(this));
            this.$filedrag.addEventListener("drop", this.filesSelected.bind(this));
            this.$filedrag.style.display = "block";


        }

        checkFileSize(maxfilesize, fileSize) {
            return fileSize <= maxfilesize ? true : false;
        }

        checkFileType(allFileExtensions, fileType) {
            let fileExtensions=[];
            fileExtensions = allFileExtensions.split(",");
            return fileType in fileExtensions ? true : false;
        }

        filesSelected(e)
        {
            let filesInnerHtml="";
            let f = e.type=='change' ? this.$fileUpload.files : e.dataTransfer.files;
            // process all File objects
            for (var i=0; i<f.length;i++){
                //Checking file attributes
                let isValidFileSize = this.checkFileSize(this.getAttribute('max-file-size'), f[i].size);
                //Checking file type
                let fileSplits= f[i].name.split('.');
                let fileType =fileSplits[fileSplits.length-1];
                let isValidFileType = this.checkFileType(this.getAttribute('accepted-file-extensions'),fileType);
                if (isValidFileSize && isValidFileType)
                    filesInnerHtml+="<div class = 'file'>"+ f[i].name + "</div>";
            }
            this.$fileList.innerHTML=filesInnerHtml;


        }

        fileDragHover(e)
        {
            e.stopPropagation();
            e.preventDefault();
            console.log (e.type);
            this.$filedrag.className = (e.type == "dragover" ? "hover" : "container filedrag");
            //this.$filedrag.className = "hover";
        }


    }

    document.registerElement('file-upload', FileUpload);
})();
