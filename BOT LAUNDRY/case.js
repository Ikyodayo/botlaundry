    const fs = require('fs')
    const util = require('util')
    const axios = require('axios')
    const { exec } = require('child_process')
    const {
        proto,
        generateWAMessageFromContent
    } = require('@whiskeysockets/baileys')

    module.exports = async (S_Armada, m) => {
        try {
            const body = (
                m.mtype === 'conversation' && m.message.conversation ||
                m.mtype === 'imageMessage' && m.message.imageMessage.caption ||
                m.mtype === 'documentMessage' && m.message.documentMessage.caption ||
                m.mtype === 'videoMessage' && m.message.videoMessage.caption ||
                m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text ||
                m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId ||
                m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId ||
                m.mtype === 'listResponseMessage' && m.message.listResponseMessage.singleSelectReply.selectedRowId
            ) || ''

            const text = typeof body === 'string' ? body.trim() : ''
            const lowerText = text.toLowerCase()
            const args = text.split(' ').slice(2)
            const q = args.join(' ')

            const sender = m.key.fromMe ? (S_Armada.user.id.split(':')[0] + '@s.whatsapp.net') : (m.key.participant || m.key.remoteJid)
            const senderNumber = sender.split('@')[0]
            const isOwner = ['6285691920202'].includes(senderNumber)

            switch (lowerText) {
                case 'hai':
                case 'laundry':
                    return S_Armada.sendMessage(m.chat, {
                        text: 'Selamat datang di laundry kami. Silahkan ketik *menu* untuk melihat menu yang tersedia!'
                    }, { quoted: m })

                case 'menu': {
                    const msg = await generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: 'Pilih menu di bawah ini'
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: 'Asisten Laundry'
                                    }),
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: '📋 MENU LAUNDRY',
                                        subtitle: 'Layanan Tersedia',
                                        hasMediaAttachment: false
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: [
                                            {
                                                name: 'single_select',
                                                buttonParamsJson: JSON.stringify({
                                                    title: 'Layanan Laundry',
                                                    sections: [
                                                        {
                                                            title: 'Pilih Layanan',
                                                            highlight_label: 'Laundry',
                                                            rows: [
                                                                {
                                                                    header: 'Status',
                                                                    title: '📦 Cek Status',
                                                                    description: 'Cek status laundry Anda berdasarkan nomor WhatsApp',
                                                                    id: 'cek status'
                                                                },
                                                                {
                                                                    header: 'Harga',
                                                                    title: '💰 Info Harga',
                                                                    description: 'Lihat daftar harga layanan laundry',
                                                                    id: 'info harga'
                                                                },
                                                                {
                                                                    header: 'Kontak',
                                                                    title: '📞 Kontak Admin',
                                                                    description: 'Hubungi admin langsung via WhatsApp',
                                                                    id: 'kontak'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                })
                                            }
                                        ]
                                    })
                                })
                            }
                        }
                    }, { quoted: m })

                    await S_Armada.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
                    break
                }
            }

            if (m.mtype === 'interactiveResponseMessage') {
                const params = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
                if (params) {
                    const parsed = JSON.parse(params)
                    const id = parsed.id?.toLowerCase()

                    if (id === 'cek status') {
                        const msg = await generateWAMessageFromContent(m.chat, {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage: proto.Message.InteractiveMessage.create({
                                        body: proto.Message.InteractiveMessage.Body.create({
                                            text: 'Silahkan ketik *cek status <nomor>*\nContoh: cek status 6281234567890\nUntuk mengecek status laundry anda.'
                                        }),
                                        footer: proto.Message.InteractiveMessage.Footer.create({
                                            text: 'Asisten Laundry'
                                        }),
                                        header: proto.Message.InteractiveMessage.Header.create({
                                            title: '📦 Cek Status',
                                            subtitle: 'Salin dan isi nomor Anda',
                                            hasMediaAttachment: false
                                        }),
                                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                            buttons: [
                                                {
                                                    name: "cta_copy",
                                                    buttonParamsJson: JSON.stringify({
                                                        display_text: "Salin Format",
                                                        id: "copy_status",
                                                        copy_code: "cek status"
                                                    })
                                                }
                                            ]
                                        })
                                    })
                                }
                            }
                        }, { quoted: m })

                        await S_Armada.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
                        return
                    }

                    if (id === 'info harga') {
                        const msg = await generateWAMessageFromContent(m.chat, {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage: proto.Message.InteractiveMessage.create({
                                        body: proto.Message.InteractiveMessage.Body.create({
                                            text: '💰 *Daftar Harga Laundry:*\n\n- Cuci Kering: Rp 10.000/kg\n- Cuci Setrika: Rp 15.000/kg\n- Selimut: Rp 25.000/pcs\n\nKlik tombol di bawah untuk hubungi admin.'
                                        }),
                                        footer: proto.Message.InteractiveMessage.Footer.create({
                                            text: 'Asisten Laundry'
                                        }),
                                        header: proto.Message.InteractiveMessage.Header.create({
                                            title: '💰 Info Harga',
                                            subtitle: 'Layanan Laundry',
                                            hasMediaAttachment: false
                                        }),
                                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                            buttons: [
                                                {
                                                    name: "cta_url",
                                                    buttonParamsJson: JSON.stringify({
                                                        display_text: "Hubungi Admin",
                                                        url: "https://wa.me/6285691920202"
                                                    })
                                                }
                                            ]
                                        })
                                    })
                                }
                            }
                        }, { quoted: m })

                        await S_Armada.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
                        return
                    }

                    if (id === 'kontak') {
                        const number = '6285691920202'
                        const ownerName = 'Admin Laundry'
                        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nORG:- \nTEL;type=CELL;type=VOICE;waid=${number}:${number}\nEND:VCARD`

                        return S_Armada.sendMessage(m.chat, {
                            contacts: {
                                displayName: ownerName,
                                contacts: [{ vcard }]
                            }
                        }, { quoted: m })
                    }
                }
            }

            if (text.startsWith('cek status')) {
                try {
                    const nomor = args[0] ? args[0].replace(/[^0-9]/g, '') : senderNumber
                    if (!args[0]) {
                        return S_Armada.sendMessage(m.chat, {
                            text: 'Silahkan ketik *cek status <nomor>*\nContoh: cek status 6281234567890\nUntuk mengecek status laundry anda.'
                        }, { quoted: m })
                    }
                    if (!/^[0-9]{9,15}$/.test(nomor)) {
                        return S_Armada.sendMessage(m.chat, {
                            text: '⚠️ Format nomor WhatsApp tidak valid. Contoh: *cek status 6281234567890*'
                        }, { quoted: m })
                    }

                    const url = `https://script.google.com/macros/s/AKfycbww_YXPGW88aeW7PAQDHgCo4fW3BZnxLAOc_xvYxMRvjgzMzRPKyB8xAqQRX9J9qxs8rQ/exec?whatsapp=${nomor}`
                    const response = await axios.get(url)
                    const userData = response.data?.data

                    if (!userData) {
                        return S_Armada.sendMessage(m.chat, {
                            text: '❌ Data laundry tidak ditemukan untuk nomor tersebut. Pastikan sudah mendaftar.'
                        }, { quoted: m })
                    }

                    const reply = `
    📦 *Status Laundry Anda:*

    👤 Nama : ${userData.nama}
    📞 No Whatsapp : ${userData.whatsapp}
    🧾 Jenis Layanan : ${userData.jenis_layanan}
    💴 Harga : ${userData.harga}
    🚚 Status : ${userData.status}

    Terima kasih telah
    menggunakan layanan kami 🙏`.trim()

                    return S_Armada.sendMessage(m.chat, { text: reply }, { quoted: m })

                } catch (err) {
                    console.log('Error saat cek status:', err)
                    return S_Armada.sendMessage(m.chat, {
                        text: '⚠️ Maaf, terjadi kesalahan saat mengambil data.'
                    }, { quoted: m })
                }
            }

            // Eval & Shell
            if (text.startsWith('=>') && isOwner) {
                try {
                    let evaled = await eval(`(async () => { return ${text.slice(3)} })()`)
                    return S_Armada.sendMessage(m.chat, { text: util.format(evaled) }, { quoted: m })
                } catch (e) {
                    return S_Armada.sendMessage(m.chat, { text: String(e) }, { quoted: m })
                }
            }

            if (text.startsWith('>') && isOwner) {
                try {
                    let evaled = await eval(`(async () => { ${text.slice(2)} })()`)
                    return S_Armada.sendMessage(m.chat, { text: util.format(evaled) }, { quoted: m })
                } catch (e) {
                    return S_Armada.sendMessage(m.chat, { text: String(e) }, { quoted: m })
                }
            }

            if (text.startsWith('$') && isOwner) {
                exec(text.slice(2), (err, stdout) => {
                    if (err) return S_Armada.sendMessage(m.chat, { text: `${err}` }, { quoted: m })
                    if (stdout) return S_Armada.sendMessage(m.chat, { text: stdout }, { quoted: m })
                })
            }

        } catch (err) {
            console.log(util.format(err))
        }
    }

    let file = require.resolve(__filename)
    fs.watchFile(file, () => {
        fs.unwatchFile(file)
        console.log(`Update ${__filename}`)
        delete require.cache[file]
        require(file)
    })
