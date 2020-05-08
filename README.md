<p align="center"><img src="https://raw.githubusercontent.com/itspedruu/lines-of-code/master/assets/banner.png"/></p>

<h1 align="center">Lines of Code</h1>

Lines of Code is a command line tool which retrieves project information such as the amount of lines of code and language usage percentage.

# Install

```
npm i -g lines-of-code
```

# Usage

This will run through the current folder and scan every file the program identifies as a code file.

```
lines-of-code
```

This filters the files by extension such as js and css

```
lines-of-code --extension js,css
```

This excludes either files or directories from being scanned

```
lines-of-code --exclude node_modules,lib
```