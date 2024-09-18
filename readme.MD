**Available miners**

**Qubic apool** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic-apool/qubic-apoolminer-autoupdate.tar.gz`

**Qubic** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic/qubic-miner-1.9.7.tar.gz`

**Qubic CPU** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic-cpu/qubic-cpu-miner-1.9.7.tar.gz`

**ChipiCoin** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/chapa/chipi-miner-1.4.tar.gz`

**Meridian** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/mrdn/mrdn-miner-1.0.tar.gz`

**Jupiter** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/jptr/jptr-miner-1.3.tar.gz`

**Xelis** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/xelis/xelis-miner-0.7.1.tar.gz`

**Upowai** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/upowai/upowai-miner-3c.tar.gz`

**GPU** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/gpu/gpu-miner-0.3.tar.gz`

**Aleo** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/aleo/aleominer-3.0.4.tar.gz`

Only the current versions are presented here. For previous versions, check the repository

**Create custom miner archive**
`rm -f files.md5 miner.tar.gz; find . -type f ! -name "files.md5" -exec md5sum {} \; > files.md5; tar -zcf miner.tar.gz *`
