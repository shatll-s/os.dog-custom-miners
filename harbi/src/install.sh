#!/bin/bash
[ -t 1 ] && . /dog/colors

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

echo -e "${GREEN}> install script complete${WHITE}"


