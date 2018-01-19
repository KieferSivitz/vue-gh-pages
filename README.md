[![npm version](https://badge.fury.io/js/vue-gh-pages.svg)](https://www.npmjs.com/package/vue-gh-pages)
[![Percentage of issues still open](http://isitmaintained.com/badge/open/kiefersivitz/vue-gh-pages.svg)](http://isitmaintained.com/project/kiefersivitz/vue-gh-pages "Percentage of issues still open")
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/kiefersivitz)

## vue-gh-pages

Since I could not find a clean way of deploying vue-cli apps to github pages, I made this one.

### Step 1: Install the module:

    npm install --save-dev vue-gh-pages

Alternatively, with yarn:

    yarn add vue-gh-pages

### Step 2: Add the following to the script section of your package.json:

    "deploy": "node ./node_modules/vue-gh-pages/index.js"

### Step 3: Add `homepage` field to your `package.json` file:
This will automatically push your builds to github.

    "homepage": "https://github.com/myusername/my-app",

    If you are using ssh you will need to add the ssh link instead:

    "homepage": "git@github.com:myusername/my-app

If this is left off you will have to commit and push the changes manually.

### Step 4: Now when you're ready to push to github, run:

    npm run deploy

This will create an optimized production build of your project ready for github pages.

### Step 5: Finally, if this is your first commit to gh-pages, go to your repository's settings on github, scroll down to the gh-pages section and change the source to:

    master branch /docs folder

#### If you get any errors about filename lengths, run the following command:
(May need administrator privileges)

    git config --system core.longpaths true

This may happen as a result of node_modules filenames being overly verbose.


That's it!

##### Note
If you'd like to try the version using async/await you can install with vue-gh-pages@beta

It should be less fragile than the current build, but I still need to test and I'm not sure when to break applications on older versions of node.