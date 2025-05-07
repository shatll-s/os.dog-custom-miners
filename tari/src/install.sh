#!/bin/bash
[ -t 1 ] && . /dog/colors

function NeedToInstall() {
	local ver=`apt-cache policy $1 | grep Installed | sed 's/Installed://; s/\s*//'`
	if [[ $2 ]]; then #min ver provided
    local majorVer=$(echo $ver | cut -d- -f1)
    if (( $(echo "$majorVer > $2" | bc -l) )); then
        echo 0
    else
        echo 1
    fi
  else
	  [[ $ver && $ver != '(none)' ]] && echo 0 || echo 1
  fi
}

if [[ $(NeedToInstall libc6 "2.32") -eq 1 ]]; then
	echo -e "> Install libc6"
	echo "deb http://cz.archive.ubuntu.com/ubuntu jammy main" >> /etc/apt/sources.list
	apt update
	apt install libc6 -yqq
else
	echo -e "${GREEN}> libc6 already installed${WHITE}"
fi

echo -e "${GREEN}> install script complete${WHITE}"


