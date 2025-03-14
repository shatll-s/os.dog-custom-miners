**Available miners**

**Gpool-miner** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/gpool-miner/gpool-miner-2025.11.1.tar.gz`

**Aleo zk.work** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/zk.work/zk.work-0.2.5-hotfix2.tar.gz`

**Aleo zk.work AMD** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/aleo-zk.work-amd/aleo-zk.work-amd-0.2.4.tar.gz`

**Lumoz zk.work** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/zk.work-moz/zk.work-moz-0.2.tar.gz`

**Aleo miner for f2pool** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/aleo-f2pool/aleominer-3.0.14.tar.gz`

**Qubic apool** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic-apool/qubic-apoolminer-autoupdate.tar.gz`

**Qubic** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic/qubic-miner-2.2.1.0.tar.gz`

**Qubic** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubminer-beta/qubminer-beta-0.1.tar.gz`

**Qubic minerlab** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic-minerlab/qubic-minerlab-0.6.tar.gz`

**Qubic CPU** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/qubic-cpu/qubic-cpu-miner-2.2.1.0.tar.gz`

**ChipiCoin** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/chapa/chipi-miner-1.4.tar.gz`

**Meridian** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/mrdn/mrdn-miner-1.0.tar.gz`

**VIP NFT** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/vipnft/vipnft-miner-0.3.tar.gz`

**Jupiter** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/jptr/jptr-miner-1.3.tar.gz`

**Xelis** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/xelis/xelis-miner-0.7.1.tar.gz`

**Upowai** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/upowai/upowai-miner-3c.tar.gz`

**GPU** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/gpu/gpu-miner-0.3.tar.gz`

**Martis** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/martis/martis-miner-0.16.tar.gz`

Only the current versions are presented here. For previous versions, check the repository

**Create custom miner archive**
`rm -f files.md5 miner.tar.gz; find . -type f ! -name "files.md5" -exec md5sum {} \; > files.md5; tar -zcf miner.tar.gz *; rm -f files.md5`
