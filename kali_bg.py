#!/usr/bin/env python3
"""Run long Kali commands in background."""
import paramiko
import sys
import time
import os

KALI_HOST = "192.168.80.128"
KALI_USER = "kali"
KALI_PASS = "kali"

def run_kali_bg(cmd, output_file):
    """Execute long command in background on Kali, save to file."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(KALI_HOST, username=KALI_USER, password=KALI_PASS, timeout=15)
    
    bg_cmd = f"nohup {cmd} > {output_file} 2>&1 &"
    stdin, stdout, stderr = client.exec_command(bg_cmd, timeout=30)
    print(f"Background scan started. Output will be at: {output_file}")
    client.close()

def get_output(output_file):
    """Get output from a background scan."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(KALI_HOST, username=KALI_USER, password=KALI_PASS, timeout=15)
    
    stdin, stdout, stderr = client.exec_command(f"cat {output_file} 2>/dev/null && echo '===EOF===' && wc -l {output_file}", timeout=30)
    output = stdout.read().decode('utf-8', errors='replace')
    client.close()
    return output

def quick_run(cmd, timeout=120):
    """Quick run with reasonable timeout."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(KALI_HOST, username=KALI_USER, password=KALI_PASS, timeout=15)
    stdin, stdout, stderr = client.exec_command(f"export PATH=$PATH:/usr/bin && {cmd}", timeout=timeout)
    output = stdout.read().decode('utf-8', errors='replace')
    error = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    client.close()
    return output, error, exit_code

if __name__ == "__main__":
    action = sys.argv[1]
    if action == "bg":
        run_kali_bg(sys.argv[2], sys.argv[3])
    elif action == "get":
        print(get_output(sys.argv[2]))
    elif action == "run":
        out, err, code = quick_run(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 120)
        if out: print(out)
        if err: print(err, file=sys.stderr)
