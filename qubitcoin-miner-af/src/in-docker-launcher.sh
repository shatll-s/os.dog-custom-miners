#!/bin/bash
. colors
#cd `dirname $0`

#	global variables, don`t change it
####################################################################################
#	The file contains the following variables:
#	MINERNAME API_PORT CUSTOM_URL POOL PASS WALLET TEMPLATE COIN ADDITION
CFG_FILENAME="miner.cfg"
. $CFG_FILENAME

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
parse_args "$ADDITION" gpu_count
remainingAddition=$REMAINING_ARGS
echo "> remaining args: $remainingAddition"
if [[ $gpu_count ]]; then
  echo "> rewriting gpu count: $GPU_COUNT -> $gpu_count"
  GPU_COUNT=$gpu_count
fi

$LINE
echo -e "${GREEN}> Starting custom miner:${WHITE}"

MY_PID=$$
echo kiska
echo "> using ${GPU_COUNT} gpus"
for ((i = 0; i < $GPU_COUNT; i++)); do
  threads=1

  echo "> GPU $i → -t $threads"
  screenName="qubitcoin-miner$i"
  apiPort="4444$i"
  log="/app/log/qubitcoin-miner$i.log"
  #  --coinbase-addr $WALLET
  batch="CUDA_VISIBLE_DEVICES=$i ./miner --algo qhash -t $threads --api-bind $apiPort"
  [[ $POOL ]] && batch="$batch --url $POOL"
  [[ $PASS ]] && batch="$batch --userpass $PASS"
  [[ $TEMPLATE ]] && batch="$batch -u $TEMPLATE"
  echo $batch
  [[ $remainingAddition ]] && batch="$batch $remainingAddition"

  fullBatch=$(cat <<EOF
(
  ( while kill -0 $MY_PID 2>/dev/null; do sleep 1; done
    echo "GPU $i: parent died, shutting down miner..."
    kill \$\$ ) &

  while true; do $batch 2>&1 | tee -a $log; done
)
EOF
)

  echo "@@ $batch @@"

  screenKill $screenName
  screen -dmS "$screenName" bash -c "$fullBatch"
done

# for infinity
tail -f /dev/null
