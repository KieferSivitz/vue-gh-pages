## vue-gh-pages

Since I could not find a clean way of deploying vue-cli apps to github pages so I made this one.

### Step 1: Install the module:

    npm install --save vue-gh-pages

Alternatively, with yarn:

    yarn add vue-gh-pages

### Step 2: Add the following to the script section of your package.json:

    "deploy": "node ./node_modules/vue-gh-pages/index.js"

### Step 3: Add `homepage` field to your `package.json` file:
This will automatically push your builds to github.

    "homepage": "https://myusername.github.io/my-app",

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

