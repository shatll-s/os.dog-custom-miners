FROM ubuntu:24.04
WORKDIR /app

## comfortable shell dependencies install
RUN apt update && apt install -y --no-install-recommends bash-completion screen

#RUN apt update && apt install -y --no-install-recommends libcurl4 libjansson4
#
### СUDA dependencies install
#RUN apt-get update && apt-get install -y --no-install-recommends wget gnupg ca-certificates
#RUN mkdir -p /etc/apt/keyrings && \
#    wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/3bf863cc.pub && \
#    gpg --dearmor < 3bf863cc.pub > /etc/apt/keyrings/cuda-archive-keyring.gpg && \
#    echo "deb [signed-by=/etc/apt/keyrings/cuda-archive-keyring.gpg] https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/ /" > /etc/apt/sources.list.d/cuda.list && \
#    apt-get update
#RUN apt install -y --no-install-recommends libcublas12 libcudart12
#ENV LD_LIBRARY_PATH=/usr/local/lib/x86_64-linux-gnu:/usr/local/cuda/lib64:/usr/local/cuda/targets/x86_64-linux/lib:$LD_LIBRARY_PATH


#COPY miner.cfg .
COPY colors .


COPY lib lib
COPY feeless-gpu-miner miner
RUN chmod +x miner

COPY in-docker-launcher.sh launcher
RUN chmod +x launcher

ENTRYPOINT ["./launcher"]
CMD []
