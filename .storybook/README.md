# storybook-ejs - About
Links - [Docs](/docs/index.md), [Website](https://www.echoalex.com/projects/storybook-ejs)

This is a alternative to storybook. This helps you write documentation and map out scenarios for your ejs templates. 

The concept of writing UI components in react and independantly testing them is a great idea. It makes sense. However for projects that uses ejs for templating, the idea of createing components is not easy. Its possible, but not easy. Javascript written in a EJS component is not localised. It can intefere with other components. 

So it might be obvious that ejs may or maynot be suited for large projects. But for projects where you want to use EJS, there is no good tooling to create EJS components. This is a story boook for EJS components. This was designed with sailjs in mind but it can be implemented in any project.


## EJS components
Write the template and the javascript associated with the component in the same component. This is not as elegant as React, but it sure does work. 


# Installation

### Pull code
Use degit to pull this code into your repo. 

```shell
degit github:alexjv89/storybook-ejs .storybook
```

we suggest installing this into a folder called `.storybook`. 

### Add script to `package.json`

Add this to your main repo's `package.json`
```shell
	"storybook":"node .storybook/index.js",
	"storybook:update":"degit github:alexjv89/storybook-ejs .storybook --force",
```

### Install dependencies
```shell
cd .storybook && npm install
```

### Run storybook

```shell
npm run storybook
```

