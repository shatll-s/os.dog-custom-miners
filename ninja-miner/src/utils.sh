#!/bin/bash

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
            elif [[ "$token" == "--$key="* ]]; then
                local var_name="${key//-/_}"
                local value="${token#--$key=}"
                export "${var_name}=$value"
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

# free port - kill process using the port
free_port() {
    local port="$1"
    if [[ -z "$port" ]]; then
        return 1
    fi
    local pid=$(fuser "$port/tcp" 2>/dev/null)
    if [[ -n "$pid" ]]; then
        echo "> Port $port is busy (PID: $pid), killing..."
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}
