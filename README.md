## vue-gh-pages

Since I could not find a clean way of deploying vue-cli apps to github pages so I made this one

Install the module

    npm install --save vue-gh-pages

Add the following to the script section of your package.json:

    "deploy": "node ./node_modules/vue-gh-pages/index.js"

Now when you're ready to push to github run

    npm run deploy

This will create an optimized production build of your project ready for github pages

Finally, if this is your first commit to gh-pages, go to your repository's settings on github, scroll down to the gh-pages section and change the source to:

    master branch /docs folder

That's it!

