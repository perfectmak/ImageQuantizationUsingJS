# Image Quantization CLI App

This is a simple Image Color Quantization CLI app that is implemented using Node js.
It is meant to be a learning project that is accompanying a tutorial post here.


## Setup Instructions
Sorry no dockerfile for this project 😀, but all that is required to run this is `node`.

So clone this repository to your directions and run `npm install` in the projects directory.

## How to Use
To perform color quantization with this App, you run the app with the parameter as described:
```
node app.js -k <number of colors> <path to image>
```
where
* `<number of colors>`: should be an integer and must be less than the total number of pixels in the image. It represents the number of colors that should be in the output quantized image.
* `<path to image>`: is the path to the image you would like to perform color quantization on.

For example:
```
node app.js -k 24 consonance.jpg
```

After successfully running, a quantized image is created in the project directory. You can view it in your favourite image viewing application.
