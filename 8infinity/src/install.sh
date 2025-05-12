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

# docker installation
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
# docker installation end

if [[ $(NeedToInstall python3) -eq 1 ]]; then
	echo -e "> Install python3"
  apt update
	apt install python3 -yqq --no-install-recommends
else
	echo -e "${GREEN}> python3 already installed${WHITE}"
fi

if [[ $(NeedToInstall python3-pip) -eq 1 ]]; then
	echo -e "> Install python3-pip"
  apt update
	apt install python3-pip -yqq --no-install-recommends
else
	echo -e "${GREEN}> python3-pip already installed${WHITE}"
fi

pip install ecdsa eth_abi web3 dotenv --quiet
pip install websocket --use-pep517 --quiet
pip install websocket-client --quiet

echo -e "${GREEN}> install script complete${WHITE}"