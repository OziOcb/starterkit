# Ozi Ocb Starter Kit

<p align="center">
	<img src="https://cloud.githubusercontent.com/assets/7629661/9838465/89626e74-5a5e-11e5-9b7d-e0ce76856732.gif" alt="Carlos Cuesta Starterkit"/>
</p>

> A simple starterkit boilerplate that I use to realize my front end static development projects. I basically rebuilt a staterkit made by this guy [Twitter](http://twitter.com/crloscuesta)! Also checkout his generator [yeoman generator-startekit](https://github.com/carloscuesta/generator-starterkit).

## Technologies

- [**Jekyll**](https://jekyllrb.com) -  A simple, extendable, static site generator.
- [**Bootstrap4**](https://getbootstrap.com) - A free front-end framework for faster and easier web development.
- [**Gulp**](http://gulpjs.com) - Automate and enhance your workflow
- [**Pug**](https://pugjs.org) - Terse language for writing HTML templates.
- [**SASS**](http://sass-lang.com) - CSS with superpowers.
- [**Babel**](https://babeljs.io) - Use next generation JavaScript, today (ES5 => ES6).
- [**NodeJS**](https://nodejs.org) - JavaScript runtime built on Chrome's V8 JavaScript engine.

## Requirements and Use

### Requirements

- [Node.js](https://nodejs.org/en/)
or (recommended)
- [Yarn.js](https://yarnpkg.com/en/)
and
- [Gulp](http://gulpjs.com)


### Use

```bash
$ git clone https://github.com/OziOcb/starterkit.git
$ cd starterkit/ && yarn install
$ gulp
```

## Tasks

```gulp```: Runs the **default task** (dev) including the following ones :

- ```styles```: SCSS compiling to CSS, css minification and autoprefixing.
- ```templates```: Pug compiling and rendering to HTML.
- ```scripts```: ES6 to ES5 with babel, scripts minification and concatenation into a single file.
- ```serve```: Starts a server at ```./dist/``` with all your compiled files, looking for file changes and injecting them into your browser.

```gulp optimize```: Optimizes your project (to improve the pagespeed) runs:

- ```inject-favicon-markups```: Creates favicons and adds them to the project
- ```uncss```: Removes unused CSS from your styles file using [uncss](https://github.com/giakki/uncss).
- ```critical```: Extract and inline critical-path (above-the-fold) CSS from HTML using [critical](https://github.com/addyosmani/critical)
- ```images```: Image compression.

```gulp deploy```: Deploy your ```dist``` folder into your server or surge cloud runs:

- ```optimize```
- ```ftp```: Uploads ```dist``` to [```ftpUploadsDir```](https://github.com/carloscuesta/starterkit/blob/master/gulpfile.js#L58).
- ```surge```: Uploads your ```dist``` to [Surge](http://surge.sh)

If you want to use the **deploy** task, you will have to edit the [```gulpfile.js```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L88-L90) lines between 88-90 with your ftp connection info: [```host```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L88) | [```user```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L89) | [```password```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L90). If you want to use [Surge](http://surge.sh) instead of FTP, just setup a domain name in the [```surgeInfo.domain```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L94)

Once you setup ```ftpCredentials```, you will have to choose a directory of your server where the deploy will go: [```ftpUploadsDir```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L81)

Now you will be able to use ```gulp deploy``` and your ```/dist/``` folder will go up to your ftp server!

Use ```npm run``` to list the gulp tasks available. You can run the tasks too using the ```npm run scriptname``` that is on the list.


## Using Bootstrap

### CSS
While using my method you don't have to worry about CSS.
Thanks to the UNCSS task that's a part of the Gulp ```Optimize``` task, all unused CSS code will be removed.

[```UNCSS```](https://github.com/OziOcb/starterkit/blob/develop/gulpfile.babel.js#L248-L356) task is set to leave a CSS code that is in use and 'special' parts of the code that are needed by Bootstrap modules that use JavaScript. In [```main.scss```](https://github.com/OziOcb/starterkit/blob/develop/assets/css/main.scss#L49-L56) file, you can comment them out if you are sure that you won't use them in your project (that gives you even better optimization).

### JS
If you don't use Boostrap you can remove its JS (and jQuery) file from the [```Scripts```](https://github.com/OziOcb/starterkit/blob/master/gulpfile.babel.js#L170) task.

Because a problem with BS4 dependencies (popper.js) I had to add a bootstrap.bundle.min.js file instead of adding all dependencies separately (please, feel free to add your solution).



<!-- ## Project Structure

```
.
├── /dist/                   # Minified, optimized and compiled files.
│   ├── /assets/             # Assets folder.
│   │   ├── /css/            # CSS style files.
│   │   ├── /files/          # Static files.
│   │   │   └── img/         # Images folder.
│   │   └── /js/             # JS files.
│   └── *.html               # Rendered and compiled HTMLs from Pug.
├── /node_modules/           # Node modules dependencies and packages.
├── /src/                    # Source files.
│   ├── /images/             # Images non compressed.
│   ├── /scripts/            # JavaScript files.
│   ├── /styles/             # SCSS style files.
│   │   └── _includes/       # Styles SCSS partials.
│   ├── /templates/          # Templating Pug files.
│   │   └── _includes/       # Templating Pug partials.
└── gulpfile.js              # Gulp automatization file.
``` -->

## Demo

![starterkit-terminal](https://cloud.githubusercontent.com/assets/7629661/10411914/803cb756-6f75-11e5-82c3-b0832b425b77.gif)

## License

The code is available under the [MIT](https://github.com/carloscuesta/starterkit/blob/master/LICENSE) license.
