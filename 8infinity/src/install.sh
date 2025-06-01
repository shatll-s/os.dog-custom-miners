#!/bin/bash

GIT_REPO=https://github.com/shatll-s/8infinity-miner
GIT_DIR=files

[ -t 1 ] && . /dog/colors

if command -v python3.10 &>/dev/null; then
    echo -e "${GREEN}> python 3.10 already installed${WHITE}"
else
    echo -e "${BROWN}> Install python 3.10${WHITE}"

    apt-get update -y
    apt-get install -y software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt-get update -y
    apt-get install -y python3.10

    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10
    python3.10 -m pip --version
    python3.10 -m pip install --upgrade pip

    if command -v python3.10 &>/dev/null; then
      echo -e "${GREEN}> python 3.10 installed${WHITE}"
    else
      echo -e "${RED}> error while trying to install python 3.10${WHITE}"
      exit 1
    fi
fi

apt-get install -yqq git
git clone $GIT_REPO.git $GIT_DIR
python3.10 -m pip  install -r $GIT_DIR/requirements.txt

echo -e "${GREEN}> install script complete${WHITE}"

