#!/bin/bash
set -e

if ldconfig -p | grep -q libcublas.so.12; then
  echo "[✔] Уже установлено: libcublas.so.12"
  exit 0
fi

echo "[*] Проверка версии Ubuntu"
UBU_VERSION=$(lsb_release -sr)
if [[ "$UBU_VERSION" != "22.04" ]]; then
  echo "[!] Скрипт предназначен для Ubuntu 22.04, а не $UBU_VERSION"
  exit 1
fi

echo "[*] Установка зависимостей"
apt update
apt install -y wget ca-certificates gnupg lsb-release

echo "[*] Скачивание pin-файла"
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600

echo "[*] Установка GPG-ключа репозитория"
curl -fsSL https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub \
  | gpg --dearmor --yes | tee /usr/share/keyrings/cuda-archive-keyring.gpg > /dev/null

echo "[*] Добавление репозитория CUDA"
echo "deb [signed-by=/usr/share/keyrings/cuda-archive-keyring.gpg] https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /" \
  > /etc/apt/sources.list.d/cuda.list

echo "[*] Обновление apt"
apt update

echo "[*] Установка библиотек CUDA (включая libcublas.so.12)"
#apt install -y cuda-libraries-12-4
apt install -y libcublas-12-4 cuda-libraries-12-4

echo "[*] Проверка установки libcublas.so.12"
if ldconfig -p | grep -q libcublas.so.12; then
  echo "[✔] Успешно установлено: libcublas.so.12"
else
  echo "[!] Установка libcublas не удалась"
  exit 1
fi
