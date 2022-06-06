module.exports = {
    name: "shop",
    description: "Магазин (страницы)",
    async messageExecute(client, message, args, config) {
        class Shop {
            constructor(arr) {
                this.pages = Math.floor(arr.length / 5.1)
                this.page = 0
                this.arr = arr
                this.emoji = {
                    "left": "<:left:965702951349919828>", //влево
                    "right": "<:right:965702951895179334>", //вправо
                    "bin": "<:bin:965702951475765408>", //корзина
                    "tr": "<:tr:965702951815487528>", //хуйня-муйня
                    "dot": "<:dot:968570788561182780>", //точка
                }
            }
            sortThis(val, valType) {
                if (isNaN(valType) || !Object.keys(this.arr[0]).includes(val)) return void 0
                const sorted = valType === -1 ?
                    this.arr.sort((a, b) => a[val] > b[val] ? 1 : -1) :
                    this.arr.sort((a, b) => a[val] < b[val] ? 1 : -1)
                return this.arr = sorted
            }
            generateReply() {
                let _a = [], _b = { type: "ACTION_ROW", components: [] }, _c = [], _d = []
                const sliced = this.arr.slice(this.page * 5, this.page * 5 + 5)
                for (let i = 0; i < sliced.length; i++) {
                    const obj = sliced[i]
                    const member = message.guild.members.resolve(obj.owner) ?? "Неизвестно"
                    _a.push(`\n**${(this.page+1) * i + 1}.** <@&${obj.role}>\n**Продавец:** \`${member.user?.tag}\`\n**Стоимость:** ${obj.cost} 💲\n**Куплена раз:** ${obj.bought}`)
                    const buttons = {
                        type: "BUTTON",
                        style: "SUCCESS",
                        label: `${(this.page+1) * i + 1}`,
                        emoji: "🛒",
                        customId: `${obj.role}_shop`
                    }
                    _b.components.push(buttons)
                    if (_b.components.length == 5) {
                        _c.push(_b)
                        _b = { type: "ACTION_ROW", components: [] }
                    }
                }
                _d = [{
                    type: "ACTION_ROW",
                    components: [{
                        type: "SELECT_MENU",
                        placeholder: 'Сортировка',
                        customId: "shopSortSelect",
                        options: [
                            {
                                label: `Сначала дешевые`,
                                value: `costMin`,
                            },
                            {
                                label: `Сначала дорогие`,
                                value: `costMax`,
                            },
                            {
                                label: `Сначала не популярные`,
                                value: `boughtMin`,
                            },
                            {
                                label: `Сначала популярные`,
                                value: `booughtMax`,
                            }
                        ],
                        max_values: 1
                    }]
                }, {
                    type: "ACTION_ROW",
                    components: [
                        {
                            type: "BUTTON",
                            style: "SECONDARY",
                            label: "Другое",
                            customId: "else",
                            disabled: true
                        },
                        {
                            type: "BUTTON",
                            style: "SECONDARY",
                            emoji: this.emoji.left,
                            customId: "left_side",
                            disabled: this.page === 0
                        },
                        {
                            type: "BUTTON",
                            style: "SECONDARY",
                            emoji: this.emoji.bin,
                            customId: "bin",
                            disabled: this.arr.length < 5
                        },
                        {
                            type: "BUTTON",
                            style: "SECONDARY",
                            emoji: this.emoji.right,
                            customId: "right_side",
                            disabled: this.page === this.pages || this.arr.length < 5
                        },
                    ]
                }]

                return {
                    embeds: [{
                        title: `Магазин ролей`,
                        description: _a.join("\n"),
                        thumbnail: { url: message.member.displayAvatarURL({ dynamic: true }) },
                        footer: { text: `Страница: ${this.page + 1}/${Math.ceil(this.arr.length / 5)}` },
                        color: "#2f3136"
                    }], components: _c.concat(_d)
                }
            }
            findSortType(val) {
                if (!val) return void 0
                switch (val) {
                    case "costMin": this.sortThis("cost", -1)
                        break
                    case "costMax": this.sortThis("cost", 1)
                        break
                    case "boughtMin": this.sortThis("bought", -1)
                        break
                    case "boughtMax": this.sortThis("bought", 1)
                        break
                }
            }
        }

        const shop = new Shop([
            { role: "891256696654135296", cost: 100, bought: 0, owner: message.member.id },
            { role: "889867593253544036", cost: 200, bought: 1, owner: message.member.id },
            { role: "889063260807127091", cost: 200, bought: 2, owner: message.member.id },
            { role: "903457000543907891", cost: 300, bought: 3, owner: message.member.id },
            { role: "903457003207278644", cost: 400, bought: 4, owner: message.member.id },
            { role: "891256693432913950", cost: 500, bought: 5, owner: message.member.id },
            { role: "920179903255683082", cost: 600, bought: 6, owner: message.member.id },
            { role: "889063260807127091", cost: 700, bought: 7, owner: message.member.id },
            { role: "903457001659592715", cost: 800, bought: 8, owner: message.member.id },
            { role: "903457004679462983", cost: 900, bought: 9, owner: message.member.id }
        ])

        const msg = await message.reply(shop.generateReply())

        const collector = await msg.createMessageComponentCollector({
            time: 120000,
            errors: ["time"],
        });

        collector
            .on("collect", (i) => {
                if (i.user.id != message.member.id) return i.deferUpdate();
                if (i.isButton()) {
                    switch (i.customId) {
                        case "bin": collector.stop();
                            break
                        case "left_side": --shop.page;
                            break
                        case "right_side": ++shop.page;
                            break
                        default: i.channel.send({content: `Тут должен типо отображаться бай <${i.customId.replace("_shop", "")}> роли, но мне попростоу лень это сейчас делать, лучше пойду в игрульки играть`})
                    }
                } else if (i.customId === "shopSortSelect") shop.findSortType(i.values[0])
                if(i.customId !== "bin") i.update(shop.generateReply())
                else i.deferUpdate()
            }).on('end', () => {
                msg.edit({
                    components: msg.components.map((row) => {
                        row.components.forEach((button) => (button.disabled = true));
                        return row;
                    }),
                });
            })
    },
};
