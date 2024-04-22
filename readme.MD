**Available miners**

**ChipiCoin** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/ChipiCoin/chipi-miner-1.4.tar.gz`

**Meridian** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/Meridian/mrdn-miner-1.0.tar.gz`

**Qubic** `https://raw.githubusercontent.com/shatll-s/os.dog-custom-miners/main/Qubic/qubic-miner-1.9.5.tar.gz`

Only the current versions are presented here. For previous versions, check the repository


**Create custom miner archive**
`rm -f files.md5 miner.tar.gz; find . -type f ! -name "files.md5" -exec md5sum {} \; > files.md5; tar -zcf miner.tar.gz *`
