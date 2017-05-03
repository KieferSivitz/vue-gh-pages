## vue-cli-gh-pages

Since I could not find a clean way of deploying to gh-pages I made this one

Install the module

    npm install vue-cli-gh-pages

Add the following to the script section of your package.json:

    "deploy": "npm run vue-cli-gh-pages start"

Now when you're ready to push to github run

    npm run deploy

This will create an optimized production build of your project ready for github pages

Finally, if this is your first commit to gh-pages, go to your repository's settings on github, scroll down to the gh-pages section and change the source to:

    master branch /docs folder

That's it!

