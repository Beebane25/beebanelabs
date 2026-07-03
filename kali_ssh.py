#!/usr/bin/env python3
"""Kali Linux SSH helper for BeebaneLabs pentest."""
import paramiko
import sys
import time

KALI_HOST = "192.168.80.128"
KALI_USER = "kali"
KALI_PASS = "kali"

def run_kali(cmd, timeout=300):
    """Execute command on Kali via SSH."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(KALI_HOST, username=KALI_USER, password=KALI_PASS, timeout=15)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    output = stdout.read().decode('utf-8', errors='replace')
    error = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    client.close()
    return output, error, exit_code

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python kali_ssh.py 'command'")
        sys.exit(1)
    cmd = sys.argv[1]
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 300
    out, err, code = run_kali(cmd, timeout)
    if out:
        print(out)
    if err:
        print(err, file=sys.stderr)
    sys.exit(code)
