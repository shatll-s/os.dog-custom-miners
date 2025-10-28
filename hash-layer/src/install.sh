#!/bin/bash
####################################################################################
###
### Hash Layer - Installation Script
### Install Node.js and dependencies
###
####################################################################################
[ -t 1 ] && . /dog/colors

function NeedToInstall() {
	local ver=`apt-cache policy $1 | grep Installed | sed 's/Installed://; s/\s*//'`
	[[ $ver && $ver != '(none)' ]] && echo 0 || echo 1
}

# Install build-essential for native modules (blake2)
if [[ $(NeedToInstall build-essential) -eq 1 ]]; then
	echo -e "> Install build-essential"
	apt update -qq
	apt install -yqq build-essential python3
else
	echo -e "${GREEN}> build-essential already installed${WHITE}"
fi

# Install nvm and Node.js
nvmVersion=$(nvm --version 2>/dev/null)
if [[ ! $nvmVersion ]]; then
	echo -e "> Install nvm"
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

	export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

	source ~/.bashrc
else
	echo -e "${GREEN}> nodejs already installed${WHITE}"
fi

NODE_MAJOR=18
nvm install $NODE_MAJOR 2>&1 | grep -v "Now using"
nvm use $NODE_MAJOR > /dev/null 2>&1

# Install npm dependencies
dir=files
if [[ -d $dir ]]; then
	cd $dir
	if [[ -f package.json ]]; then
		echo -e "> Install npm dependencies"
		npm install
	fi
	cd ..
fi

echo -e "${GREEN}> install script complete${WHITE}"
