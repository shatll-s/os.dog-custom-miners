#!/bin/bash
[ -t 1 ] && . /dog/colors

GIT_REPO='https://github.com/ChipiCoin/ChipiCoinGpuMiner'

function NeedToInstall() {
	local ver=`apt-cache policy $1 | grep Installed | sed 's/Installed://; s/\s*//'`
	[[ $ver && $ver != '(none)' ]] && echo 0 || echo 1
}

if [[ $(NeedToInstall libc6) -eq 1 ]]; then
	echo -e "> Install libc6"
	echo "deb http://cz.archive.ubuntu.com/ubuntu jammy main" >> /etc/apt/sources.list
	apt update
	apt install libc6 -yqq
else
	echo -e "${GREEN}> libc6 already installed${WHITE}"
fi

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

NODE_MAJOR=20
nvm install $NODE_MAJOR
nvm use $NODE_MAJOR

if [[ $(NeedToInstall git) -eq 1 ]]; then
	echo "> Install git"
	apt install -yqq git
else
	echo "${GREEN}> git already installed${WHITE}"
fi

dir=files
if [[ ! -d $dir/.git ]]; then
	echo "> git dir does not exist, cloning"
	git clone $GIT_REPO.git $dir
	wget https://github.com/tontechio/pow-miner-gpu/releases/download/20211230.1/minertools-cuda-ubuntu-18.04-x86-64.tar.gz -O minertools.tar.gz
	tar -xzvf minertools.tar.gz -C $dir
	cd $dir
	npm i
else
	echo -e "${GREEN}> git dir exist, just pull${WHITE}"
	cd $dir
	git pull
	npm i
fi

cd ..

[[ ! `cat /etc/mtab | grep "$dir/bocs tmpfs"` ]] && mount -t tmpfs tmpfs $dir/bocs -o size=20m

echo -e "${GREEN}> install script complete${WHITE}"

