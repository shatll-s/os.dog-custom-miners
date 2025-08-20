#!/bin/bash
. colors

#	global variables, don`t change it
####################################################################################
#	The file contains the following variables:
#	MINERNAME API_PORT CUSTOM_URL POOL PASS WALLET TEMPLATE COIN ADDITION
CFG_FILENAME="miner.cfg"
. $CFG_FILENAME
LOG="/app/log/feeless-gpu.log"
#	custom package variables
####################################################################################
#	custom package body
####################################################################################

function screenKill () {
        [[ `screen -ls | grep -c "$1"` -gt 0 ]] && screenCommand "$1" ^C && sleep 1.5
        PID=$(screen -ls | grep -E "$1[^-]" | sed 's/\s\([0-9]*\)..*/\1/')
        [[ ! -z $PID ]] && kill $PID
}

# parse args
parse_args() {
    local args="$1"
    shift
    local keys=("$@")

    read -ra tokens <<< "$args"
    local filtered=()

    for ((i = 0; i < ${#tokens[@]}; i++)); do
        local token="${tokens[i]}"
        local is_key=0

        for key in "${keys[@]}"; do
            if [[ "$token" == "--$key" ]]; then
                local var_name="${key//-/_}"
                if (( i + 1 < ${#tokens[@]} )); then
                    local value="${tokens[$((i+1))]}"
                    export "${var_name}=$value"
                else
                    export "${var_name}="
                fi
                ((i++)) # skip the value
                is_key=1
                break
            fi
        done

        if [[ $is_key -eq 0 ]]; then
            filtered+=("${token}")
        fi
    done

    REMAINING_ARGS="${filtered[*]}"  # Set global variable instead
}


echo "> additional args: $ADDITION"
REMAINING_ARGS=""
parse_args "$ADDITION" priv http ws
remainingAddition=$REMAINING_ARGS
PRIVATE="${priv:-$WALLET}"

#echo "> using arg threads_per_gpu: $threads_per_gpu"
echo "> remaining args: $remainingAddition"
#if [[ $gpu_count ]]; then
#  echo "> rewriting gpu count: $GPU_COUNT -> $gpu_count"
#  GPU_COUNT=$gpu_count
#fi

# feeless-gpu-miner arguments:
#   --priv <hex32>            secp256k1 private key (32-byte hex)
#   --http <url>              node HTTP base (default http://localhost:8000)
#   --ws <url>                node WS url (optional; reserved)
#   --devices <csv>           GPU indexes, e.g. 0 or 0,1 (default: all)
#   --workers <N|auto>        per process; default auto (=per GPU)
#   --start-batch <N>         autotune start (default 128)
#   --max-batch <N>           autotune upper bound (default 2048)
#   --step-factor <f>         autotune growth factor (default 1.15)
#   --step-seconds <N>        measure seconds per step (default 8)
#   --warmup-seconds <N>      warmup (default 3)
#   --tolerance <f>           stop if gain < tol (default 0.02)
#   --by-segment <0|1>        argon2 kernel mode (default 0)
#   --precompute <0|1>        precompute refs (default 1)

batch="./miner"
[[ -n "$PRIVATE" ]] && batch+=" --priv $PRIVATE"
[[ -n "$http" ]] && batch+=" --http $http"
[[ -n "$ws" ]] && batch+=" --ws $ws"

[[ -n "$remainingAddition" ]] && batch+=" $remainingAddition"
$LINE
echo -e "${GREEN}> Starting custom miner${WHITE}"
echo "$batch"

#	unbuffer is needed to keep colors with tee
unbuffer $batch 2>&1 | tee --append $LOG


#
#MY_PID=$$
#cpus=$(nproc)
#echo "> using ${GPU_COUNT} gpus"
#for ((i = 0; i < $GPU_COUNT; i++)); do
#  # Calculate threads based on threads_per_gpu or auto-calculate
#  if [[ $threads_per_gpu ]]; then
#    threads=$threads_per_gpu
#  else
#    threads=$((cpus / GPU_COUNT))
#    [[ $threads -lt 2 ]] && threads=2
#  fi
#
#  # Calculate CPU affinity with cyclic distribution
#  start_cpu=$(((i * threads) % cpus))
#  end_cpu=$((start_cpu + threads - 1))
#
#  # Create bitmask for CPU affinity
#  affinity_mask=0
#  for ((j = start_cpu; j <= end_cpu; j++)); do
#    cpu_idx=$((j % cpus))
#    affinity_mask=$((affinity_mask | (1 << cpu_idx)))
#  done
#  cpu_affinity=$(printf "0x%X" $affinity_mask)
#
#  echo "> GPU $i → -t $threads → CPU affinity $cpu_affinity"
#  screenName="qubitcoin-miner$i"
#  apiPort="4444$i"
#  log="/app/log/qubitcoin-miner$i.log"
#  #  --coinbase-addr $WALLET
#  batch="CUDA_VISIBLE_DEVICES=$i ./miner --algo qhash -t $threads --cpu-affinity $cpu_affinity --api-bind 0.0.0.0:$apiPort"
#  [[ $POOL ]] && batch="$batch --url $POOL"
#  [[ $PASS ]] && batch="$batch --userpass $PASS"
#  [[ $TEMPLATE ]] && batch="$batch -u $TEMPLATE"
#  echo $batch
#  [[ $remainingAddition ]] && batch="$batch $remainingAddition"
#
#  fullBatch=$(cat <<EOF
#(
#  ( while kill -0 $MY_PID 2>/dev/null; do sleep 1; done
#    echo "GPU $i: parent died, shutting down miner..."
#    kill \$\$ ) &
#
#  while true; do $batch 2>&1 | tee -a $log; done
#)
#EOF
#)
#
#  echo "@@ $batch @@"
#
#  screenKill $screenName
#  screen -dmS "$screenName" bash -c "$fullBatch"
#done
#
## for infinity
#tail -f /dev/null
