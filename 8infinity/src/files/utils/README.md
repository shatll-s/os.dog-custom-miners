# Speed comparison 

#### create_signature_ab

```sh
python3 -m timeit -n 100 -r 100 --setup "from create_signature_ab.base import create_signature_ab" "create_signature_ab('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c', '0xdead')"
```

```sh
python3 -m timeit -n 100 -r 100 --setup "from create_signature_ab.optimized import create_signature_ab" "create_signature_ab('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c', '0xdead')"
```


|  | Time (best of 100 tries) |
|--|--|
| Base (100 times) | 116 usec |
|Optimized (100 times) | 183 usec |
