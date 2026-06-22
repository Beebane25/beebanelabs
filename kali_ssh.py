#!/usr/bin/env python3
"""Kali Linux SSH Helper for BeebaneLabs Security Audit"""
import paramiko
import sys

KALI_HOST = '192.168.80.128'
KALI_USER = 'kali'
KALI_PASS = 'kali'

def run_kali(cmd, timeout=60):
    """Execute command on Kali Linux via SSH"""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(KALI_HOST, username=KALI_USER, password=KALI_PASS, timeout=10)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    output = stdout.read().decode()
    errors = stderr.read().decode()
    client.close()
    return output, errors

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python kali_ssh.py 'command'")
        sys.exit(1)
    
    cmd = sys.argv[1]
    out, err = run_kali(cmd)
    if out:
        print(out)
    if err:
        print("STDERR:", err)
