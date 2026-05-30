# Miner adaptation notes

## Miner structure

```
miner-name/
├── src/
│   ├── miner          # launcher script
│   ├── stats          # stats script
│   ├── utils.sh       # utilities (argument parsing)
│   └── miner executable
└── miner-name-X.X.tar.gz  # version archives
```

## Building a new version

```bash
cd miner-name/src
rm -f files.md5 rgminer-0.9.0.tar.gz
find . -type f ! -name "files.md5" -exec md5sum {} \; > files.md5
tar -zcf rgminer-0.9.0.tar.gz *
rm -f files.md5
mv rgminer-0.9.0.tar.gz ../miner-name-X.X.tar.gz
```

## Adapting a new miner

1. Copy `utils.sh` from dogminer/src/
2. In `miner`:
   - Source utils.sh: `. ./utils.sh`
   - Parse the needed arguments: `parse_args "$ADDITION" devices threadsPerCard ...`
   - GPU logic: if `--devices` is passed — use it, otherwise auto-detect
3. In `stats`:
   - Parse the miner log (grep/awk)
   - Convert units to h/s
   - Build JSON with fields: miner, algo, total_hr, hr[], busid[], online, ver

## Commit format

```
miner_name: version (optional: description)
```

Examples:
- `xnt-drpool: 0.2`
- `goldenminer: 0.1.7+1`
- `dogminer: 0.1 (initial commit)`
- `xnt-drpool: 0.2 (stats added)`
