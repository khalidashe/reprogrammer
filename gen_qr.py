import qrcode

url = "exp://192.168.8.114:8081"
img = qrcode.make(url)
out = "expo-qr-8081.png"
img.save(out)
print("wrote", out, "for", url)
