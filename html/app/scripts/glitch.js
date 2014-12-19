'use strict';

// ideas via https://github.com/mutaphysis/smackmyglitchupjs/blob/master/glitch.html

angular.module('isihlononoApp')
.factory('Glitch', [function () {

  // We return this object to anything injecting our service
  var Service = function() {
    var self = this;
    this.online = true;
    var image;
    var canvas;
    var canvasWidth;
    var canvasHeight;
    var ctx;
    var imageData;
    var jpgHeaderLength;
    var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64Map = base64Chars.split("");
    var reverseBase64Map = {}; base64Map.forEach(function(val, key) { reverseBase64Map[val] = key} );
    var initialImage = new Image();
    var imgDataArr;

    // http://stackoverflow.com/a/1484514/229189
    var getRandomColor = function()
    {
      var letters = '0123456789ABCDEF'.split( '' );
      var color = '#';

      for ( var i = 0; i < 6; i++ )
      {
        color += letters[ Math.round(Math.random() * 15) ];
      }
      return color;
    };

    var detectJpegHeaderSize = function(data) {
      jpgHeaderLength = 417;
      for (var i = 0, l = data.length; i < l; i++) {
        if (data[i] == 0xFF && data[i+1] == 0xDA) {
          //console.log("xxxxxxx<<<<", data[i], data[i+1], i, l);
          jpgHeaderLength = i + 2; return;
        }
      }
    };

    // base64 is 2^6, byte is 2^8, every 4 base64 values create three bytes
    var base64ToByteArray = function(str) {
      var result = [], digitNum, cur, prev;
      for (var i = 23, l = str.length; i < l; i++) {
        cur = reverseBase64Map[str.charAt(i)];
        digitNum = (i-23) % 4;
        switch(digitNum){
          //case 0: first digit - do nothing, not enough info to work with
          case 1: //second digit
          result.push(prev << 2 | cur >> 4);
          break;
          case 2: //third digit
          result.push((prev & 0x0f) << 4 | cur >> 2);
          break;
          case 3: //fourth digit
          result.push((prev & 3) << 6 | cur);
          break;
        }
        prev = cur;
      }
      return result;
    };

    var byteArrayToBase64 = function(arr) {
      var result = ["data:image/jpeg;base64,"], byteNum, cur, prev;
      for (var i = 0, l = arr.length; i < l; i++) {
        cur = arr[i];
        byteNum = i % 3;
        switch (byteNum) {
          case 0: //first byte
          result.push(base64Map[cur >> 2]);
          break;
          case 1: //second byte
          result.push(base64Map[(prev & 3) << 4 | (cur >> 4)]);
          break;
          case 2: //third byte
          result.push(base64Map[(prev & 0x0f) << 2 | (cur >> 6)]);
          result.push(base64Map[cur & 0x3f]);
          break;
        }
        prev = cur;
      }
      if (byteNum == 0) {
        result.push(base64Map[(prev & 3) << 4]);
        result.push("==");
      } else if (byteNum == 1) {
        result.push(base64Map[(prev & 0x0f) << 2]);
        result.push("=");
      }
      return result.join("");
    };

    var glitchJpegBytes = function(strArr) {
      var rnd = Math.floor(jpgHeaderLength + Math.random() * (strArr.length - jpgHeaderLength - 4));
      strArr[rnd] = Math.floor(Math.random() * 256);
    };

    var glitchJpeg = function() {
      var glitchCopy = imgDataArr.slice();
      for (var i = 0; i < 10; i++) {
        glitchJpegBytes(glitchCopy);
      }
      var img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        setTimeout(glitchJpeg, 50);
      }
      img.src = byteArrayToBase64(glitchCopy);
    };

    this.init = function(canvasElementId) {
      canvas = document.getElementById(canvasElementId);
      canvasWidth = canvas.clientWidth;
      canvasHeight = canvas.clientHeight;
      ctx = canvas.getContext('2d');

      // draw a white background (transparent pixels are converted to black after glitching)
      ctx.fillStyle = '#FFF';
      ctx.fillRect( 0, 0, canvasWidth, canvasHeight );
    };

    this.redraw = function(imageBytes) {
      var img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
      }
      img.src = byteArrayToBase64(imageBytes);
    };


    this.fuzz = function(varA, varB) {
      if (self.online) {
        
        varA = Math.abs(Math.floor(varA * 10));
        varB = Math.abs(Math.floor(varB * 10));
        if (varA <= 1) {
          varA = 0;
        }
        if (varB <= 1) {
          varB = 0;
        }

        var glitchCopy = imgDataArr.slice();
        for (var i = 0; i < varA; i++) {
          glitchJpegBytes(glitchCopy);
        }

        this.redraw(glitchCopy);
      }
    };

    this.glitch = function(imageSrc) {
      initialImage.onload = function() {
        console.log('Loading a fake JPG image');
        ctx.drawImage(initialImage, 0, 0);
        var imgData = canvas.toDataURL("image/jpeg");
        imgDataArr = base64ToByteArray(imgData);
        detectJpegHeaderSize(imgDataArr);
      };
      initialImage.src = imageSrc;
    };

    this.setOnline = function(onlineState) {
      self.online = onlineState;
    };

  };

  return new Service();

}])

;
