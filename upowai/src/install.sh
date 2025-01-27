#!/bin/bash
[ -t 1 ] && . /dog/colors

function NeedToInstall() {
	local ver=`apt-cache policy $1 | grep Installed | sed 's/Installed://; s/\s*//'`
	[[ $ver && $ver != '(none)' ]] && echo 0 || echo 1
}

if [[ $(NeedToInstall libjson-c5) -eq 1 ]]; then
	echo -e "> Install libjson-c5"

  # remove extra lines
  sed '/deb http:\/\/cz\.archive\.ubuntu\.com\/ubuntu jammy main/d' -i /etc/apt/sources.list
	echo "deb http://cz.archive.ubuntu.com/ubuntu jammy main" >> /etc/apt/sources.list
	apt update
	apt install libjson-c5 -yqq
else
	echo -e "${GREEN}> libc6 already installed${WHITE}"
fi

echo -e "${GREEN}> install script complete${WHITE}"

