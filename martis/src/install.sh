#!/bin/bash
[ -t 1 ] && . /dog/colors

GIT_REPO='https://github.com/martiscoin/node.git'

function NeedToInstall() {
	local ver=`apt-cache policy $1 | grep Installed | sed 's/Installed://; s/\s*//'`
	[[ $ver && $ver != '(none)' ]] && echo 0 || echo 1
}

# install microsoft repo
package="packages-microsoft-prod"
if [[ $(NeedToInstall $package) -eq 1 ]]; then
	echo -e "${BROWN}> Install $package${WHITE}"

	wget https://packages.microsoft.com/config/ubuntu/20.04/$package.deb -O $package.deb
  dpkg -i $package.deb
  rm $package.deb
else
	echo -e "${GREEN}> $package already installed${WHITE}"
fi

# install dotnet
package="dotnet-sdk-8.0"
if [[ $(NeedToInstall $package) -eq 1 ]]; then
	echo -e -e "${BROWN}> Install $package${WHITE}"
  apt-get update
  apt-get install -yqq $package
else
	echo -e "${GREEN}> $package already installed${WHITE}"
fi

#dir=$HOME/.martiscoin/
#mkdir -p $dir
#cp msc.conf $dir

# update grub to allow ipv6
if [[ $(cat /etc/default/grub | grep -c ipv6.disable=1) -ne 0 ]]; then
  sed -i "s/ipv6.disable=1 //" /etc/default/grub
  sleep 1
  update-grub
  msg "Need to reboot" info "Need to reboot after GRUB update"
fi

# remove some packages
echo -e "${GREEN}> Check if we need to remove some packages${WHITE}"
package="opencl-amdgpu-pro-icd"
if [[ $(dpkg -l | grep $package -c) -ne 0 ]]; then
  apt-get remove -yqq --purge $package
fi

package="opencl-legacy-amdgpu-pro-icd:amd64"
if [[ $(dpkg -l | grep $package -c) -ne 0 ]]; then
  apt-get remove -yqq --purge $package
fi

package="rocm-opencl"
if [[ $(dpkg -l | grep $package -c) -ne 0 ]]; then
  apt-get remove -yqq --purge $package
fi
echo -e "${GREEN}> All unwanted packages removed${WHITE}"

# install git
#package="git"
#if [[ $(NeedToInstall $package) -eq 1 ]]; then
#	echo -e "${BROWN}> Install $package${WHITE}"
#	apt install -yqq $package
#else
#	echo -e "${GREEN}> $package already installed${WHITE}"
#fi

### comment git clone ###
#dir=files
#if [[ ! -d $dir/.git ]]; then
#  [[ ! -d $dir ]] && mkdir $dir
#	echo -e "${BROWN}> git dir does not exist, cloning${WHITE}"
#	git clone $GIT_REPO $dir
#
#	# now there is no need to do it, files is already in package
#	#wget https://github.com/tontechio/pow-miner-gpu/releases/download/20211230.1/minertools-cuda-ubuntu-18.04-x86-64.tar.gz -O minertools.tar.gz
#	#tar -xzvf minertools.tar.gz -C $dir
##	cd $dir
##	npm i
#else
#	echo -e "${GREEN}> git dir exist, just pull${WHITE}"
#	cd $dir
#	git pull
#fi
### comment git clone end ###
#cd ..
#
## if we have modified files, than change them
#filesToChange=("send_multigpu.js" "givers.js" "pow-miner-cuda")
#for (( i = 0; i < ${#filesToChange[@]}; i++ )); do
#    fileToChange=${filesToChange[$i]}
#    if [[ ! -f $fileToChange ]]; then
#      echo -e "${RED}> File ${CYAN}$fileToChange${RED} is in in replacement list, but not found, ignore${WHITE}"
#      continue
#    fi
#
#    echo -e "${GREEN}> Replace ${CYAN}$fileToChange${WHITE}"
#    cp $fileToChange $dir/$fileToChange
#done
#
#tmpDirName=/tmp/bocs`date +%s`
#mkdir $tmpDirName
#rm -rf `realpath $dir`/bocs
#ln -s $tmpDirName `realpath $dir`/bocs

echo -e "${GREEN}> install script complete${WHITE}"

