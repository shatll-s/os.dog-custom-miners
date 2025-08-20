#!/bin/bash
[ -t 1 ] && . /dog/colors

install_docker_full() {
    echo -e "${WHITE}> Checking and installing Docker and dependencies...${WHITE}"

    # ca-certificates
    if dpkg -s ca-certificates >/dev/null 2>&1; then
        echo -e "${GREEN}> ca-certificates already installed${WHITE}"
    else
        echo -e "${BROWN}> ca-certificates not found. Installing...${WHITE}"
        apt-get install -y ca-certificates
    fi

    # curl
    if command -v curl >/dev/null 2>&1; then
        echo -e "${GREEN}> curl already installed${WHITE}"
    else
        echo -e "${BROWN}> curl not found. Installing...${WHITE}"
        apt-get install -y curl
    fi

    # /etc/apt/keyrings
    if [ -d /etc/apt/keyrings ]; then
        echo -e "${GREEN}> /etc/apt/keyrings already exists${WHITE}"
    else
        echo -e "${BROWN}> /etc/apt/keyrings not found. Creating...${WHITE}"
        install -m 0755 -d /etc/apt/keyrings
    fi

    # docker.asc key
    if [ -f /etc/apt/keyrings/docker.asc ]; then
        echo -e "${GREEN}> Docker GPG key already exists${WHITE}"
    else
        echo -e "${BROWN}> Docker GPG key not found. Downloading...${WHITE}"
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
        chmod a+r /etc/apt/keyrings/docker.asc
    fi

    # docker.list repository
    if [ -f /etc/apt/sources.list.d/docker.list ]; then
        echo -e "${GREEN}> Docker repository already exists${WHITE}"
    else
        echo -e "${BROWN}> Docker repository not found. Adding...${WHITE}"
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
        tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
    fi

    # Docker Engine
    if command -v docker >/dev/null 2>&1; then
        echo -e "${GREEN}> Docker already installed${WHITE}"
    else
        echo -e "${BROWN}> Docker not found. Installing...${WHITE}"
        apt-get install -y docker-ce docker-ce-cli containerd.io
    fi

    # Docker Compose plugin
    if docker compose version >/dev/null 2>&1; then
        echo -e "${GREEN}> Docker Compose plugin already installed${WHITE}"
    else
        echo -e "${BROWN}> Docker Compose plugin not found. Installing...${WHITE}"
        apt-get install -y docker-compose-plugin
    fi

    echo -e "${GREEN}> all components checked${WHITE}"
}

install_nvidia_container_toolkit() {
    echo -e "${WHITE}> Checking and installing NVIDIA Container Toolkit...${WHITE}"

    if dpkg -s nvidia-container-toolkit >/dev/null 2>&1; then
        echo -e "${GREEN}> nvidia-container-toolkit already installed${WHITE}"
        return 0
    fi

    echo -e "${BROWN}> nvidia-container-toolkit not found. Installing...${WHITE}"

    if [ ! -f /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg ]; then
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
            sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
    fi

    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

    apt-get update
    apt-get install -y nvidia-container-toolkit

    echo -e "${WHITE}> Restart Docker${WHITE}"
    systemctl restart docker

    echo -e "${GREEN}> nvidia-container-toolkit installed${WHITE}"
}


echo -e "${GREEN}> install script started${WHITE}"
install_docker_full
install_nvidia_container_toolkit
echo -e "${GREEN}> install script complete${WHITE}"
