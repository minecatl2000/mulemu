!(function () {
    class e {
        getCores() {
            var e = {
                atari5200: ["a5200"],
                vb: ["beetle_vb"],
                nds: ["melonds", "desmume", "desmume2015"],
                arcade: ["fbneo", "fbalpha2012_cps1", "fbalpha2012_cps2"],
                nes: ["fceumm", "nestopia"],
                gb: ["gambatte"],
                coleco: ["gearcoleco"],
                segaMS: ["smsplus", "genesis_plus_gx", "picodrive"],
                segaMD: ["genesis_plus_gx", "picodrive"],
                segaGG: ["genesis_plus_gx"],
                segaCD: ["genesis_plus_gx", "picodrive"],
                sega32x: ["picodrive"],
                sega: ["genesis_plus_gx", "picodrive"],
                lynx: ["handy"],
                mame: ["mame2003_plus", "mame2003"],
                ngp: ["mednafen_ngp"],
                pce: ["mednafen_pce"],
                pcfx: ["mednafen_pcfx"],
                psx: ["pcsx_rearmed", "mednafen_psx_hw"],
                ws: ["mednafen_wswan"],
                gba: ["mgba"],
                n64: ["mupen64plus_next", "parallel_n64"],
                "3do": ["opera"],
                psp: ["ppsspp"],
                atari7800: ["prosystem"],
                snes: ["snes9x"],
                atari2600: ["stella2014"],
                jaguar: ["virtualjaguar"],
                segaSaturn: ["yabause"],
                amiga: ["puae"],
                c64: ["vice_x64sc"],
                c128: ["vice_x128"],
                pet: ["vice_xpet"],
                plus4: ["vice_xplus4"],
                vic20: ["vice_xvic"],
            };
            return this.isSafari && this.isMobile && (e.n64 = e.n64.reverse()), e;
        }
        requiresThreads(e) {
            return ["ppsspp"].includes(e);
        }
        requiresWebGL2(e) {
            return ["ppsspp"].includes(e);
        }
        getCore(e) {
            var t = this.getCores(),
                i = this.config.system;
            if (e) {
                for (var n in t) if (t[n].includes(i)) return n;
                return i;
            }
            e = this.getCore(!0);
            return t[e] && t[e].includes(this.preGetSetting("retroarch_core")) ? this.preGetSetting("retroarch_core") : t[i] ? t[i][0] : i;
        }
        createElement(e) {
            return document.createElement(e);
        }
        addEventListener(t, e, i) {
            var n = e.split(" "),
                s = [];
            for (let e = 0; e < n.length; e++) {
                t.addEventListener(n[e], i);
                var o = { cb: i, elem: t, listener: n[e] };
                s.push(o), this.listeners.push(o);
            }
            return s;
        }
        removeEventListener(t) {
            for (let e = 0; e < t.length; e++) t[e].elem.removeEventListener(t[e].listener, t[e].cb);
        }
        downloadFile(n, s, o, l) {
            return new Promise(async (i) => {
                var t = this.toData(n);
                if (t)
                    t.then((e) => {
                        "HEAD" === l.method ? i({ headers: {} }) : i({ headers: {}, data: e });
                    });
                else {
                    t = o ? "" : this.config.dataPath;
                    (n = t + n), !o && this.config.filePaths && "string" == typeof this.config.filePaths[n.split("/").pop()] && (n = this.config.filePaths[n.split("/").pop()]);
                    let e;
                    try {
                        e = new URL(n);
                    } catch (e) {}
                    if (e && !["http:", "https:"].includes(e.protocol))
                        if ("HEAD" === l.method) i({ headers: {} });
                        else
                            try {
                                let e = await fetch(n);
                                if ((l.type && "arraybuffer" === l.type.toLowerCase()) || !l.type) e = await e.arrayBuffer();
                                else {
                                    e = await e.text();
                                    try {
                                        e = JSON.parse(e);
                                    } catch (e) {}
                                }
                                n.startsWith("blob:") && URL.revokeObjectURL(n), i({ data: e, headers: {} });
                            } catch (e) {
                                i(-1);
                            }
                    else {
                        let t = new XMLHttpRequest();
                        s instanceof Function &&
                            t.addEventListener("progress", (e) => {
                                e = e.total ? " " + Math.floor((e.loaded / e.total) * 100).toString() + "%" : " " + (e.loaded / 1048576).toFixed(2) + "MB";
                                s(e);
                            }),
                            (t.onload = function () {
                                if (t.readyState === t.DONE) {
                                    let e = t.response;
                                    if (t.status.toString().startsWith("4") || t.status.toString().startsWith("5")) i(-1);
                                    else {
                                        try {
                                            e = JSON.parse(e);
                                        } catch (e) {}
                                        i({ data: e, headers: { "content-length": t.getResponseHeader("content-length") } });
                                    }
                                }
                            }),
                            l.responseType && (t.responseType = l.responseType),
                            (t.onerror = () => i(-1)),
                            t.open(l.method, n, !0),
                            t.send();
                    }
                }
            });
        }
        toData(t, e) {
            return t instanceof ArrayBuffer || t instanceof Uint8Array || t instanceof Blob
                ? !!e ||
                      new Promise(async (e) => {
                          t instanceof ArrayBuffer ? e(new Uint8Array(t)) : t instanceof Uint8Array ? e(t) : t instanceof Blob && e(new Uint8Array(await t.arrayBuffer())), e();
                      })
                : null;
        }
        checkForUpdates() {
            this.ejs_version.endsWith("-beta")
                ? console.warn("Using EmulatorJS beta. Not checking for updates. This instance may be out of date. Using stable is highly recommended unless you build and ship your own cores.")
                : fetch("https://cdn.emulatorjs.org/stable/data/version.json").then((e) => {
                      e.ok &&
                          e.text().then((e) => {
                              e = JSON.parse(e);
                              this.versionAsInt(this.ejs_version) < this.versionAsInt(e.version) &&
                                  console.log("Using EmulatorJS version " + this.ejs_version + " but the newest version is " + e.current_version + "\nopen https://github.com/EmulatorJS/EmulatorJS to update");
                          });
                  });
        }
        versionAsInt(e) {
            return e.endsWith("-beta") ? 99999999 : (1 === (e = e.split("."))[e.length - 1].length && (e[e.length - 1] = "0" + e[e.length - 1]), parseInt(e.join("")));
        }
        constructor(e, t) {
            if (
                ((this.ejs_version = "4.2.1"),
                (this.extensions = []),
                this.initControlVars(),
                (this.debug = !0 === window.EJS_DEBUG_XX),
                (this.debug || (window.location && ["localhost", "127.0.0.1"].includes(location.hostname))) && this.checkForUpdates(),
                (this.netplayEnabled = !0 === window.EJS_DEBUG_XX && !0 === window.EJS_EXPERIMENTAL_NETPLAY),
                (this.config = t),
                (this.config.settingsLanguage = window.EJS_settingsLanguage || !1),
                (this.currentPopup = null),
                (this.isFastForward = !1),
                (this.isSlowMotion = !1),
                (this.failedToStart = !1),
                (this.rewindEnabled = "enabled" === this.preGetSetting("rewindEnabled")),
                (this.touch = !1),
                (this.cheats = []),
                (this.started = !1),
                (this.volume = "number" == typeof this.config.volume ? this.config.volume : 0.5),
                this.config.defaultControllers && (this.defaultControllers = this.config.defaultControllers),
                (this.muted = !1),
                (this.paused = !0),
                (this.listeners = []),
                (this.missingLang = []),
                this.setElements(e),
                this.setColor(this.config.color || ""),
                (this.config.alignStartButton = "string" == typeof this.config.alignStartButton ? this.config.alignStartButton : "bottom"),
                (this.config.backgroundColor = "string" == typeof this.config.backgroundColor ? this.config.backgroundColor : "rgb(51, 51, 51)"),
                this.config.adUrl && ((this.config.adSize = Array.isArray(this.config.adSize) ? this.config.adSize : ["300px", "250px"]), this.setupAds(this.config.adUrl, this.config.adSize[0], this.config.adSize[1])),
                (this.isMobile = (() => {
                    let e = !1;
                    var t;
                    return (
                        (t = navigator.userAgent || navigator.vendor || window.opera),
                        (e =
                            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                                t
                            ) ||
                            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                                t.substr(0, 4)
                            )
                                ? !0
                                : e)
                    );
                })()),
                (this.canvas = this.createElement("canvas")),
                this.canvas.classList.add("ejs_canvas"),
                (this.videoRotation = [0, 1, 2, 3].includes(this.config.videoRotation) ? this.config.videoRotation : this.preGetSetting("videoRotation") || 0),
                (this.videoRotationChanged = !1),
                this.bindListeners(),
                (this.config.netplayUrl = this.config.netplayUrl || "https://netplay.emulatorjs.org"),
                (this.fullscreen = !1),
                (this.enableMouseLock = !1),
                (this.supportsWebgl2 = !!document.createElement("canvas").getContext("webgl2") && !0 !== this.config.forceLegacyCores),
                (this.webgl2Enabled = !("disabled" === (t = this.preGetSetting("webgl2Enabled")) || !this.supportsWebgl2) && ("enabled" === t || null)),
                (this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)),
                this.config.disableDatabases
                    ? (this.storage = { rom: new window.EJS_DUMMYSTORAGE(), bios: new window.EJS_DUMMYSTORAGE(), core: new window.EJS_DUMMYSTORAGE() })
                    : (this.storage = { rom: new window.EJS_STORAGE("EmulatorJS-roms", "rom"), bios: new window.EJS_STORAGE("EmulatorJS-bios", "bios"), core: new window.EJS_STORAGE("EmulatorJS-core", "core") }),
                (this.storage.states = new window.EJS_STORAGE("EmulatorJS-states", "states")),
                this.game.classList.add("ejs_game"),
                "string" == typeof this.config.backgroundImg
                    ? (this.game.classList.add("ejs_game_background"),
                      this.config.backgroundBlur && this.game.classList.add("ejs_game_background_blur"),
                      this.game.setAttribute("style", "--ejs-background-image: url(" + this.config.backgroundImg + "); --ejs-background-color: " + this.config.backgroundColor + ";"),
                      this.on("start", () => {
                          this.game.classList.remove("ejs_game_background"), this.config.backgroundBlur && this.game.classList.remove("ejs_game_background_blur");
                      }))
                    : this.game.setAttribute("style", "--ejs-background-color: " + this.config.backgroundColor + ";"),
                Array.isArray(this.config.cheats))
            )
                for (let e = 0; e < this.config.cheats.length; e++) {
                    var i = this.config.cheats[e];
                    Array.isArray(i) && i[0] && i[1] && this.cheats.push({ desc: i[0], checked: !1, code: i[1], is_permanent: !0 });
                }
            this.createStartButton(), this.handleResize();
        }
        setColor(e) {
            function t(i) {
                if ((i = i.toLowerCase()) && /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(i)) {
                    if (4 === i.length) {
                        let t = "#";
                        for (let e = 1; e < 4; e++) t += i.slice(e, e + 1) + i.slice(e, e + 1);
                        i = t;
                    }
                    var t = [];
                    for (let e = 1; e < 7; e += 2) t.push(parseInt("0x" + i.slice(e, e + 2), 16));
                    return t.join(", ");
                }
                return null;
            }
            (e = "string" != typeof e ? "" : e) && null !== t(e) ? this.elements.parent.setAttribute("style", "--ejs-primary-color:" + t(e) + ";") : this.elements.parent.setAttribute("style", "--ejs-primary-color: 26,175,255;");
        }
        setupAds(e, t, i) {
            let n = this.createElement("div");
            "number" == typeof this.config.adMode && -1 < this.config.adMode && this.config.adMode < 3 && this.config.adMode;
            n.classList.add("ejs_ad_iframe");
            var s = this.createElement("iframe");
            (s.src = e), s.setAttribute("scrolling", "no"), s.setAttribute("frameborder", "no"), (s.style.width = t), (s.style.height = i);
            let o = this.createElement("div");
            o.classList.add("ejs_ad_close");
            e = this.createElement("a");
            o.appendChild(e),
                o.setAttribute("hidden", ""),
                n.appendChild(o),
                n.appendChild(s),
                1 !== this.config.adMode && this.elements.parent.appendChild(n),
                this.addEventListener(e, "click", () => {
                    n.remove();
                }),
                this.on("start-clicked", () => {
                    0 === this.config.adMode && n.remove(), 1 === this.config.adMode && this.elements.parent.appendChild(n);
                }),
                this.on("start", () => {
                    o.removeAttribute("hidden");
                    var e = "number" == typeof this.config.adTimer && 0 < this.config.adTimer ? this.config.adTimer : 1e4;
                    -1 === this.config.adTimer && n.remove(),
                        0 !== this.config.adTimer &&
                            setTimeout(() => {
                                n.remove();
                            }, e);
                });
        }
        adBlocked(e, t) {
            if (t) document.querySelector('div[class="ejs_ad_iframe"]').remove();
            else {
                try {
                    document.querySelector('div[class="ejs_ad_iframe"]').remove();
                } catch (e) {}
                (this.config.adUrl = e), this.setupAds(this.config.adUrl, this.config.adSize[0], this.config.adSize[1]);
            }
        }
        on(e, t) {
            this.functions || (this.functions = {}), Array.isArray(this.functions[e]) || (this.functions[e] = []), this.functions[e].push(t);
        }
        callEvent(e, t) {
            return this.functions || (this.functions = {}), Array.isArray(this.functions[e]) ? (this.functions[e].forEach((e) => e(t)), this.functions[e].length) : 0;
        }
        setElements(e) {
            var t = this.createElement("div"),
                e = document.querySelector(e);
            (e.innerHTML = ""), e.appendChild(t), (this.game = t), (this.elements = { main: this.game, parent: e }), this.elements.parent.classList.add("ejs_parent"), this.elements.parent.setAttribute("tabindex", -1);
        }
        createStartButton() {
            var e = this.createElement("div");
            e.classList.add("ejs_start_button");
            let t = 0;
            "string" == typeof this.config.backgroundImg && (e.classList.add("ejs_start_button_border"), (t = 1)),
                (e.innerText = "string" == typeof this.config.startBtnName ? this.config.startBtnName : this.localization("Start Game")),
                "top" == this.config.alignStartButton ? (e.style.bottom = "calc(100% - 20px)") : "center" == this.config.alignStartButton && (e.style.bottom = "calc(50% + 22.5px + " + t + "px)"),
                this.elements.parent.appendChild(e),
                this.addEventListener(e, "touchstart", () => {
                    this.touch = !0;
                }),
                this.addEventListener(e, "click", this.startButtonClicked.bind(this)),
                !0 === this.config.startOnLoad && this.startButtonClicked(e),
                setTimeout(() => {
                    this.callEvent("ready");
                }, 20);
        }
        startButtonClicked(e) {
            this.callEvent("start-clicked"), "touch" === e.pointerType && (this.touch = !0), (e.preventDefault ? (e.preventDefault(), e.target) : e).remove(), this.createText(), this.downloadGameCore();
        }
        createText() {
            (this.textElem = this.createElement("div")),
                this.textElem.classList.add("ejs_loading_text"),
                "string" == typeof this.config.backgroundImg && this.textElem.classList.add("ejs_loading_text_glow"),
                (this.textElem.innerText = this.localization("Loading...")),
                this.elements.parent.appendChild(this.textElem);
        }
        localization(e, t) {
            if (void 0 !== e)
                return (
                    (!(e = e.toString()).includes("EmulatorJS v") &&
                        this.config.langJson &&
                        (void 0 === t && (t = !0),
                        !this.config.langJson[e] && t && (this.missingLang.includes(e) || this.missingLang.push(e), console.log("Translation not found for '" + e + "'. Language set to '" + this.config.language + "'")),
                        this.config.langJson[e])) ||
                    e
                );
        }
        checkCompression(e, i, t) {
            return (
                this.compression || (this.compression = new window.EJS_COMPRESSION(this)),
                i && (this.textElem.innerText = i),
                this.compression.decompress(
                    e,
                    (e, t) => {
                        this.textElem.innerText = t ? i + e : e;
                    },
                    t
                )
            );
        }
        checkCoreCompatibility(e) {
            if (this.versionAsInt(e.minimumEJSVersion) > this.versionAsInt(this.ejs_version))
                throw (this.startGameError(this.localization("Outdated EmulatorJS version")), new Error("Core requires minimum EmulatorJS version of " + e.minimumEJSVersion));
        }
        startGameError(e) {
            console.log(e),
                (this.textElem.innerText = e),
                (this.textElem.style.color = "red"),
                (this.textElem.style.bottom = "10%"),
                this.setupSettingsMenu(),
                this.loadSettings(),
                this.menu.failedToStart(),
                this.handleResize(),
                (this.failedToStart = !0);
        }
        downloadGameCore() {
            if (((this.textElem.innerText = this.localization("Download Game Core")), !this.config.threads && this.requiresThreads(this.getCore())))
                this.startGameError(this.localization("Error for site owner") + "\n" + this.localization("Check console")), console.warn("This core requires threads, but EJS_threads is not set!");
            else if (!this.supportsWebgl2 && this.requiresWebGL2(this.getCore())) this.startGameError(this.localization("Outdated graphics driver"));
            else if (this.config.threads && "function" != typeof window.SharedArrayBuffer)
                this.startGameError(this.localization("Error for site owner") + "\n" + this.localization("Check console")),
                    console.warn("Threads is set to true, but the SharedArrayBuffer function is not exposed. Threads requires 2 headers to be set when sending you html page. See https://stackoverflow.com/a/68630724");
            else {
                let o = (e) => {
                    (this.defaultCoreOpts = {}),
                        this.checkCompression(new Uint8Array(e), this.localization("Decompress Game Core")).then((e) => {
                            let t, i, n;
                            for (var s in e) {
                                var o;
                                s.endsWith(".wasm")
                                    ? (n = e[s])
                                    : s.endsWith(".worker.js")
                                    ? (i = e[s])
                                    : s.endsWith(".js")
                                    ? (t = e[s])
                                    : "build.json" === s
                                    ? this.checkCoreCompatibility(JSON.parse(new TextDecoder().decode(e[s])))
                                    : "core.json" === s
                                    ? ((o = JSON.parse(new TextDecoder().decode(e[s]))),
                                      (this.extensions = o.extensions),
                                      (this.coreName = o.name),
                                      (this.repository = o.repo),
                                      (this.defaultCoreOpts = o.options),
                                      (this.enableMouseLock = o.options.supportsMouse),
                                      (this.retroarchOpts = o.retroarchOpts),
                                      (this.saveFileExt = o.save))
                                    : "license.txt" === s && (this.license = new TextDecoder().decode(e[s]));
                            }
                            !1 === this.saveFileExt && ((this.elements.bottomBar.saveSavFiles[0].style.display = "none"), (this.elements.bottomBar.loadSavFiles[0].style.display = "none")), this.initGameCore(t, n, i);
                        });
                };
                var e = "cores/reports/" + this.getCore() + ".json";
                this.downloadFile(e, null, !1, { responseType: "text", method: "GET" }).then(async (e) => {
                    (e = -1 === e || "string" == typeof e || "string" == typeof e.data ? {} : e.data).buildStart || (console.warn("Could not fetch core report JSON! Core caching will be disabled!"), (e.buildStart = 100 * Math.random())),
                        null === this.webgl2Enabled && (this.webgl2Enabled = !!e.options && e.options.defaultWebGL2),
                        this.requiresWebGL2(this.getCore()) && (this.webgl2Enabled = !0);
                    let t = !1;
                    "function" == typeof window.SharedArrayBuffer && ((i = this.preGetSetting("ejs_threads")), (t = i ? "enabled" === i : this.config.threads));
                    var i = this.supportsWebgl2 && this.webgl2Enabled ? "" : "-legacy",
                        i = this.getCore() + (t ? "-thread" : "") + i + "-wasm.data";
                    if (!this.debug) {
                        var n = await this.storage.core.get(i);
                        if (n && n.version === e.buildStart) return void o(n.data);
                    }
                    n = "cores/" + i;
                    let s = await this.downloadFile(
                        n,
                        (e) => {
                            this.textElem.innerText = this.localization("Download Game Core") + e;
                        },
                        !1,
                        { responseType: "arraybuffer", method: "GET" }
                    );
                    if (-1 === s) {
                        if (
                            (console.log("File not found, attemping to fetch from emulatorjs cdn."),
                            console.error("**THIS METHOD IS A FAILSAFE, AND NOT OFFICIALLY SUPPORTED. USE AT YOUR OWN RISK**"),
                            -1 ===
                                (s = await this.downloadFile(
                                    `https://cdn.emulatorjs.org/${this.ejs_version}/data/` + n,
                                    (e) => {
                                        this.textElem.innerText = this.localization("Download Game Core") + e;
                                    },
                                    !0,
                                    { responseType: "arraybuffer", method: "GET" }
                                )))
                        )
                            return void (this.supportsWebgl2 ? this.startGameError(this.localization("Network Error")) : this.startGameError(this.localization("Outdated graphics driver")));
                        console.warn("File was not found locally, but was found on the emulatorjs cdn.\nIt is recommended to download the stable release from here: https://cdn.emulatorjs.org/releases/");
                    }
                    o(s.data), this.storage.core.put(i, { version: e.buildStart, data: s.data });
                });
            }
        }
        initGameCore(e, t, i) {
            var n = this.createElement("script");
            (n.src = URL.createObjectURL(new Blob([e], { type: "application/javascript" }))),
                n.addEventListener("load", () => {
                    this.initModule(t, i);
                }),
                document.body.appendChild(n);
        }
        getBaseFileName(e) {
            if (!this.started && !e) return null;
            if (e && "game" !== this.config.gameUrl && !this.config.gameUrl.startsWith("blob:")) return this.config.gameUrl.split("/").pop().split("#")[0].split("?")[0];
            if ("string" == typeof this.config.gameName) {
                e = this.config.gameName.replace(/[#<$+%>!`&*'|{}/\\?"=@:^\r\n]/gi, "").trim();
                if (e) return e;
            }
            return this.fileName ? ((e = this.fileName.split(".")).splice(e.length - 1, 1), e.join(".")) : "game";
        }
        saveInBrowserSupported() {
            return !(!window.indexedDB || ("string" != typeof this.config.gameName && this.config.gameUrl.startsWith("blob:")));
        }
        displayMessage(e, t) {
            this.msgElem || ((this.msgElem = this.createElement("div")), this.msgElem.classList.add("ejs_message"), this.elements.parent.appendChild(this.msgElem)),
                clearTimeout(this.msgTimeout),
                (this.msgTimeout = setTimeout(
                    () => {
                        this.msgElem.innerText = "";
                    },
                    "number" == typeof t && 0 < t ? t : 3e3
                )),
                (this.msgElem.innerText = e);
        }
        downloadStartState() {
            return new Promise((t, e) => {
                "string" == typeof this.config.loadState || this.toData(this.config.loadState, !0)
                    ? ((this.textElem.innerText = this.localization("Download Game State")),
                      this.downloadFile(
                          this.config.loadState,
                          (e) => {
                              this.textElem.innerText = this.localization("Download Game State") + e;
                          },
                          !0,
                          { responseType: "arraybuffer", method: "GET" }
                      ).then((e) => {
                          -1 === e
                              ? this.startGameError(this.localization("Network Error"))
                              : (this.on("start", () => {
                                    setTimeout(() => {
                                        this.gameManager.loadState(new Uint8Array(e.data));
                                    }, 10);
                                }),
                                t());
                      }))
                    : t();
            });
        }
        downloadGameFile(o, l, a, r) {
            return new Promise(async (t, e) => {
                if (!(("string" == typeof o && o.trim()) || this.toData(o, !0))) return t(o);
                var i = async (e) => {
                    var t,
                        i = await this.checkCompression(new Uint8Array(e), r);
                    for (t in i) {
                        var n = "/" + this.fileName,
                            n = n.substring(0, n.length - n.split("/").pop().length);
                        if ("!!notCompressedData" === t) {
                            this.gameManager.FS.writeFile(n + o.split("/").pop().split("#")[0].split("?")[0], i[t]);
                            break;
                        }
                        t.endsWith("/") || this.gameManager.FS.writeFile(n + t.split("/").pop(), i[t]);
                    }
                };
                if (((this.textElem.innerText = a), !this.debug)) {
                    let e = await this.downloadFile(o, null, !0, { method: "HEAD" });
                    var n = await this.storage.rom.get(o.split("/").pop());
                    if (n && n["content-length"] === e.headers["content-length"] && n.type === l) return await i(n.data), t(o);
                }
                let s = await this.downloadFile(
                    o,
                    (e) => {
                        this.textElem.innerText = a + e;
                    },
                    !0,
                    { responseType: "arraybuffer", method: "GET" }
                );
                -1 === s
                    ? (this.startGameError(this.localization("Network Error")), t(o))
                    : (o instanceof File ? (o = o.name) : this.toData(o, !0) && (o = "game"),
                      await i(s.data),
                      t(o),
                      (n = "number" == typeof this.config.cacheLimit ? this.config.cacheLimit : 1073741824),
                      parseFloat(s.headers["content-length"]) < n && this.saveInBrowserSupported() && "game" !== o && this.storage.rom.put(o.split("/").pop(), { "content-length": s.headers["content-length"], data: s.data, type: l }));
            });
        }
        downloadGamePatch() {
            return new Promise(async (e) => {
                (this.config.gamePatchUrl = await this.downloadGameFile(this.config.gamePatchUrl, "patch", this.localization("Download Game Patch"), this.localization("Decompress Game Patch"))), e();
            });
        }
        downloadGameParent() {
            return new Promise(async (e) => {
                (this.config.gameParentUrl = await this.downloadGameFile(this.config.gameParentUrl, "parent", this.localization("Download Game Parent"), this.localization("Decompress Game Parent"))), e();
            });
        }
        downloadBios() {
            return new Promise(async (e) => {
                (this.config.biosUrl = await this.downloadGameFile(this.config.biosUrl, "bios", this.localization("Download Game BIOS"), this.localization("Decompress Game BIOS"))), e();
            });
        }
        downloadRom() {
            let r = (e) => {
                this.getCore();
                return !!this.extensions && this.extensions.includes(e);
            };
            return new Promise((a) => {
                this.textElem.innerText = this.localization("Download Game Data");
                let n = (t) => {
                        if (["arcade", "mame"].includes(this.getCore(!0))) (this.fileName = this.getBaseFileName(!0)), this.gameManager.FS.writeFile(this.fileName, new Uint8Array(t)), a();
                        else {
                            let n = this.getBaseFileName(!0),
                                e = !1,
                                l =
                                    ((e =
                                        !(
                                            !["pcsx_rearmed", "genesis_plus_gx", "picodrive", "mednafen_pce", "smsplus", "vice_x64", "vice_x64sc", "vice_x128", "vice_xvic", "vice_xplus4", "vice_xpet", "puae"].includes(this.getCore()) ||
                                            void 0 !== this.config.disableCue
                                        ) || this.config.disableCue),
                                    []);
                            this.checkCompression(new Uint8Array(t), this.localization("Decompress Game Data"), (e, t) => {
                                if (e.includes("/")) {
                                    var i = e.split("/");
                                    let t = "";
                                    for (let e = 0; e < i.length - 1; e++) "" === i[e] || ((t += "/" + i[e]), this.gameManager.FS.analyzePath(t).exists) || this.gameManager.FS.mkdir(t);
                                }
                                e.endsWith("/") ? this.gameManager.FS.mkdir(e) : "!!notCompressedData" === e ? (this.gameManager.FS.writeFile(n, t), l.push(n)) : (this.gameManager.FS.writeFile("/" + e, t), l.push(e));
                            }).then(() => {
                                let i = null,
                                    n = null,
                                    s = null,
                                    o = null;
                                l.forEach((e) => {
                                    var t = e.split(".").pop().toLowerCase();
                                    null === n && r(t) && (n = e),
                                        null === i && ["iso", "cso", "chd", "elf"].includes(t) && (i = e),
                                        ["cue", "ccd", "toc", "m3u"].includes(t) &&
                                            ("psx" === this.getCore(!0) ? "m3u" === o || (null !== s && "m3u" !== t) || ((s = e), (o = t)) : ["cue", "ccd"].includes(o) || (null !== s && !["cue", "ccd"].includes(t)) || ((s = e), (o = t)));
                                }),
                                    null !== n ? (this.fileName = n) : (this.fileName = l[0]),
                                    null !== i && (r("iso") || r("cso") || r("chd") || r("elf"))
                                        ? (this.fileName = i)
                                        : (r("cue") || r("ccd") || r("toc") || r("m3u")) && (null !== s ? (this.fileName = s) : e || (this.fileName = this.gameManager.createCueFile(l))),
                                    a();
                            });
                        }
                    },
                    s = async () => {
                        var e,
                            t = await this.downloadFile(
                                this.config.gameUrl,
                                (e) => {
                                    this.textElem.innerText = this.localization("Download Game Data") + e;
                                },
                                !0,
                                { responseType: "arraybuffer", method: "GET" }
                            );
                        -1 === t
                            ? this.startGameError(this.localization("Network Error"))
                            : (this.config.gameUrl instanceof File ? (this.config.gameUrl = this.config.gameUrl.name) : this.toData(this.config.gameUrl, !0) && (this.config.gameUrl = "game"),
                              n(t.data),
                              (e = "number" == typeof this.config.cacheLimit ? this.config.cacheLimit : 1073741824),
                              parseFloat(t.headers["content-length"]) < e &&
                                  this.saveInBrowserSupported() &&
                                  "game" !== this.config.gameUrl &&
                                  this.storage.rom.put(this.config.gameUrl.split("/").pop(), { "content-length": t.headers["content-length"], data: t.data }));
                    };
                this.debug
                    ? s()
                    : this.downloadFile(this.config.gameUrl, null, !0, { method: "HEAD" }).then(async (e) => {
                          var t = "string" == typeof this.config.gameUrl ? this.config.gameUrl.split("/").pop() : "game",
                              i = await this.storage.rom.get(t);
                          i && i["content-length"] === e.headers["content-length"] && "game" !== t ? n(i.data) : s();
                      });
            });
        }
        downloadFiles() {
            (async () => {
                (this.gameManager = new window.EJS_GameManager(this.Module, this)),
                    await this.gameManager.loadExternalFiles(),
                    await this.gameManager.mountFileSystems(),
                    "ppsspp" === this.getCore() && (await this.gameManager.loadPpssppAssets()),
                    await this.downloadRom(),
                    await this.downloadBios(),
                    await this.downloadStartState(),
                    await this.downloadGameParent(),
                    await this.downloadGamePatch(),
                    this.startGame();
            })();
        }
        initModule(t, i) {
            if ("function" != typeof window.EJS_Runtime) throw (console.warn("EJS_Runtime is not defined!"), this.startGameError(this.localization("Failed to start game")), new Error("EJS_Runtime is not defined!"));
            window
                .EJS_Runtime({
                    noInitialRun: !0,
                    onRuntimeInitialized: null,
                    arguments: [],
                    preRun: [],
                    postRun: [],
                    canvas: this.canvas,
                    print: (e) => {
                        this.debug && console.log(e);
                    },
                    printErr: (e) => {
                        this.debug && console.log(e);
                    },
                    totalDependencies: 0,
                    monitorRunDependencies: () => {},
                    locateFile: function (e) {
                        return (
                            this.debug && console.log(e),
                            e.endsWith(".wasm") ? URL.createObjectURL(new Blob([t], { type: "application/wasm" })) : e.endsWith(".worker.js") ? URL.createObjectURL(new Blob([i], { type: "application/javascript" })) : void 0
                        );
                    },
                    getSavExt: () => (this.saveFileExt ? "." + this.saveFileExt : ".srm"),
                })
                .then((e) => {
                    (this.Module = e), this.downloadFiles();
                })
                .catch((e) => {
                    console.warn(e), this.startGameError(this.localization("Failed to start game"));
                });
        }
        startGame() {
            try {
                var e = [];
                if (
                    (this.debug && e.push("-v"),
                    e.push("/" + this.fileName),
                    this.debug && console.log(e),
                    this.Module.callMain(e),
                    "number" == typeof this.config.softLoad &&
                        0 < this.config.softLoad &&
                        (this.resetTimeout = setTimeout(() => {
                            this.gameManager.restart();
                        }, 1e3 * this.config.softLoad)),
                    this.Module.resumeMainLoop(),
                    this.checkSupportedOpts(),
                    this.setupDisksMenu(),
                    1 < this.gameManager.getDiskCount() || (this.diskParent.style.display = "none"),
                    this.setupSettingsMenu(),
                    this.loadSettings(),
                    this.updateCheatUI(),
                    this.updateGamepadLabels(),
                    this.muted || this.setVolume(this.volume),
                    !0 !== this.config.noAutoFocus && this.elements.parent.focus(),
                    this.textElem.remove(),
                    (this.textElem = null),
                    this.game.classList.remove("ejs_game"),
                    this.game.appendChild(this.canvas),
                    this.handleResize(),
                    (this.started = !0),
                    (this.paused = !1),
                    this.touch && (this.virtualGamepad.style.display = ""),
                    this.handleResize(),
                    this.config.fullscreenOnLoad)
                )
                    try {
                        this.toggleFullscreen(!0);
                    } catch (e) {
                        this.debug && console.warn("Could not fullscreen on load");
                    }
                this.menu.open(), this.isSafari && this.isMobile && this.checkStarted();
            } catch (e) {
                return console.warn("Failed to start game", e), this.startGameError(this.localization("Failed to start game")), void this.callEvent("exit");
            }
            this.callEvent("start");
        }
        checkStarted() {
            (async () => {
                var e;
                let t = "suspended",
                    i;
                for (; "suspended" === t; ) {
                    if (!this.Module.AL) return;
                    if (
                        (this.Module.AL.currentCtx.sources.forEach((e) => {
                            t = e.gain.context.state;
                        }),
                        "suspended" !== t)
                    )
                        break;
                    i ||
                        ((i = this.createPopup("", {})),
                        ((e = this.createElement("button")).innerText = this.localization("Click to resume Emulator")),
                        e.classList.add("ejs_menu_button"),
                        (e.style.width = "25%"),
                        (e.style.height = "25%"),
                        i.appendChild(e),
                        (i.style["text-align"] = "center"),
                        (i.style["font-size"] = "28px")),
                        await ((t) => new Promise((e) => setTimeout(e, t)))(10);
                }
                i && this.closePopup();
            })();
        }
        bindListeners() {
            this.createContextMenu(),
                this.createBottomMenuBar(),
                this.createControlSettingMenu(),
                this.createCheatsMenu(),
                this.createNetplayMenu(),
                this.setVirtualGamepad(),
                this.addEventListener(this.elements.parent, "keydown keyup", this.keyChange.bind(this)),
                this.addEventListener(this.elements.parent, "mousedown touchstart", (e) => {
                    document.activeElement !== this.elements.parent && !0 !== this.config.noAutoFocus && this.elements.parent.focus();
                }),
                this.addEventListener(window, "resize", this.handleResize.bind(this));
            let n = 0;
            (this.elements.statePopupPanel = this.createPopup("", {}, !0)),
                (this.elements.statePopupPanel.innerText = this.localization("Drop save state here to load")),
                (this.elements.statePopupPanel.style["text-align"] = "center"),
                (this.elements.statePopupPanel.style["font-size"] = "28px"),
                this.addEventListener(window, "webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", () => {
                    setTimeout(() => {
                        this.handleResize.bind(this), !0 !== this.config.noAutoFocus && this.elements.parent.focus();
                    }, 0);
                }),
                this.addEventListener(window, "beforeunload", (e) => {
                    this.started && this.callEvent("exit");
                }),
                this.addEventListener(this.elements.parent, "dragenter", (e) => {
                    e.preventDefault(), this.started && (n++, (this.elements.statePopupPanel.parentElement.style.display = "block"));
                }),
                this.addEventListener(this.elements.parent, "dragover", (e) => {
                    e.preventDefault();
                }),
                this.addEventListener(this.elements.parent, "dragleave", (e) => {
                    e.preventDefault(), this.started && 0 === --n && (this.elements.statePopupPanel.parentElement.style.display = "none");
                }),
                this.addEventListener(this.elements.parent, "dragend", (e) => {
                    e.preventDefault(), this.started && ((n = 0), (this.elements.statePopupPanel.parentElement.style.display = "none"));
                }),
                this.addEventListener(this.elements.parent, "drop", (e) => {
                    if ((e.preventDefault(), this.started)) {
                        (this.elements.statePopupPanel.parentElement.style.display = "none"), (n = 0);
                        var i = e.dataTransfer.items;
                        let t;
                        for (let e = 0; e < i.length; e++)
                            if ("file" === i[e].kind) {
                                t = i[e];
                                break;
                            }
                        t &&
                            t
                                .getAsFile()
                                .arrayBuffer()
                                .then((e) => {
                                    this.gameManager.loadState(new Uint8Array(e));
                                });
                    }
                }),
                (this.gamepad = new s()),
                this.gamepad.on("connected", (e) => {
                    this.gamepadLabels && this.updateGamepadLabels();
                }),
                this.gamepad.on("disconnected", (e) => {
                    setTimeout(this.updateGamepadLabels.bind(this), 10);
                }),
                this.gamepad.on("axischanged", this.gamepadEvent.bind(this)),
                this.gamepad.on("buttondown", this.gamepadEvent.bind(this)),
                this.gamepad.on("buttonup", this.gamepadEvent.bind(this));
        }
        checkSupportedOpts() {
            this.gameManager.supportsStates() ||
                ((this.elements.bottomBar.saveState[0].style.display = "none"),
                (this.elements.bottomBar.loadState[0].style.display = "none"),
                (this.elements.bottomBar.netplay[0].style.display = "none"),
                (this.elements.contextMenu.save.style.display = "none"),
                (this.elements.contextMenu.load.style.display = "none")),
                ("number" == typeof this.config.gameId && this.config.netplayUrl && !1 !== this.netplayEnabled) || (this.elements.bottomBar.netplay[0].style.display = "none");
        }
        updateGamepadLabels() {
            for (let e = 0; e < this.gamepadLabels.length; e++) this.gamepad.gamepads[e] ? (this.gamepadLabels[e].innerText = this.gamepad.gamepads[e].id) : (this.gamepadLabels[e].innerText = "n/a");
        }
        createLink(e, t, i, n) {
            var s = this.createElement("a");
            (s.href = t), (s.target = "_blank"), (s.innerText = this.localization(i)), n ? ((t = this.createElement("p")).appendChild(s), e.appendChild(t)) : e.appendChild(s);
        }
        createContextMenu() {
            (this.elements.contextmenu = this.createElement("div")),
                this.elements.contextmenu.classList.add("ejs_context_menu"),
                this.addEventListener(this.game, "contextmenu", (e) => {
                    var t, i, n;
                    e.preventDefault(),
                        (this.config.buttonOpts && !1 === this.config.buttonOpts.rightClick) ||
                            !this.started ||
                            ((n = this.elements.parent.getBoundingClientRect()),
                            (this.elements.contextmenu.style.display = "block"),
                            (t = this.elements.contextmenu.getBoundingClientRect()),
                            (i = e.offsetY + t.height > n.bottom - 25),
                            (n = e.offsetX + t.width > n.right - 5),
                            (this.elements.contextmenu.style.left = e.offsetX - (n ? t.width : 0) + "px"),
                            (this.elements.contextmenu.style.top = e.offsetY - (i ? t.height : 0) + "px"));
                });
            let g = () => {
                    this.elements.contextmenu.style.display = "none";
                },
                s =
                    (this.addEventListener(this.elements.contextmenu, "contextmenu", (e) => e.preventDefault()),
                    this.addEventListener(this.elements.parent, "contextmenu", (e) => e.preventDefault()),
                    this.addEventListener(this.game, "mousedown", g),
                    this.createElement("ul"));
            var e = (e, t, i) => {
                var n = this.createElement("li"),
                    t = (t && (n.hidden = !0), this.createElement("a"));
                return (
                    i instanceof Function &&
                        this.addEventListener(n, "click", (e) => {
                            e.preventDefault(), i();
                        }),
                    (t.href = "#"),
                    (t.onclick = "return false"),
                    (t.innerText = this.localization(e)),
                    n.appendChild(t),
                    s.appendChild(n),
                    g(),
                    n
                );
            };
            let i;
            var t = e("Take Screenshot", !1, () => {
                i && URL.revokeObjectURL(i),
                    this.gameManager.screenshot().then((e) => {
                        var e = new Blob([e]),
                            e = ((i = URL.createObjectURL(e)), this.createElement("a")),
                            t = ((e.href = i), new Date());
                        (e.download = this.getBaseFileName() + "-" + t.getMonth() + "-" + t.getDate() + "-" + t.getFullYear() + ".png"), e.click(), g();
                    });
            });
            let n = null,
                o = e("Start screen recording", !1, () => {
                    null !== n && n.stop(), (n = this.screenRecord()), o.setAttribute("hidden", "hidden"), l.removeAttribute("hidden"), g();
                }),
                l = e("Stop screen recording", !0, () => {
                    null !== n && (n.stop(), (n = null)), o.removeAttribute("hidden"), l.setAttribute("hidden", "hidden"), g();
                });
            var a = e("Quick Save", !1, () => {
                    var e = this.settings["save-state-slot"] || "1";
                    this.gameManager.quickSave(e), this.displayMessage(this.localization("SAVED STATE TO SLOT") + " " + e), g();
                }),
                r = e("Quick Load", !1, () => {
                    var e = this.settings["save-state-slot"] || "1";
                    this.gameManager.quickLoad(e), this.displayMessage(this.localization("LOADED STATE FROM SLOT") + " " + e), g();
                });
            (this.elements.contextMenu = { screenshot: t, startScreenRecording: o, stopScreenRecording: l, save: a, load: r }),
                e("EmulatorJS v" + this.ejs_version, !1, () => {
                    g();
                    var e = this.createPopup("EmulatorJS", {
                            Close: () => {
                                this.closePopup();
                            },
                        }),
                        t = this.createElement("div");
                    t.classList.add("ejs_list_selector");
                    let s = this.createElement("ul");
                    var i = (e, t, i) => {
                        var n = this.createElement("li"),
                            t = (t && (n.hidden = !0), this.createElement("a"));
                        return (
                            i instanceof Function &&
                                this.addEventListener(n, "click", (e) => {
                                    e.preventDefault(), i();
                                }),
                            (t.href = "#"),
                            (t.onclick = "return false"),
                            (t.innerText = this.localization(e)),
                            n.appendChild(t),
                            s.appendChild(n),
                            g(),
                            n
                        );
                    };
                    let n = this.createElement("div"),
                        o = this.createElement("div"),
                        l = ((o.style.display = "none"), this.createElement("div")),
                        a = ((l.style.display = "none"), this.createElement("div")),
                        r = ((a.style.display = "none"), e.appendChild(n), e.appendChild(o), e.appendChild(l), e.appendChild(a), n);
                    (n.innerText = "EmulatorJS v" + this.ejs_version),
                        n.appendChild(this.createElement("br")),
                        n.appendChild(this.createElement("br")),
                        this.createLink(n, "https://github.com/EmulatorJS/EmulatorJS", "View on GitHub", !0),
                        this.createLink(n, "https://discord.gg/6akryGkETU", "Join the discord", !0);
                    var c = this.createElement("div");
                    this.createLink(c, "https://emulatorjs.org", "EmulatorJS"),
                        (c.innerHTML += " is powered by "),
                        this.createLink(c, "https://github.com/libretro/RetroArch/", "RetroArch"),
                        this.repository && this.coreName && ((c.innerHTML += ". This core is powered by "), this.createLink(c, this.repository, this.coreName)),
                        (c.innerHTML += "."),
                        n.appendChild(c),
                        n.appendChild(this.createElement("br")),
                        t.appendChild(s),
                        e.appendChild(t);
                    let d = (e) => {
                        r !== e && (r && (r.style.display = "none"), ((r = e).style.display = ""));
                    };
                    i("Home", !1, () => {
                        d(n);
                    }),
                        i("EmulatorJS License", !1, () => {
                            d(o);
                        }),
                        i("RetroArch License", !1, () => {
                            d(l);
                        }),
                        this.coreName &&
                            this.license &&
                            (i(this.coreName + " License", !1, () => {
                                d(a);
                            }),
                            (a.style["text-align"] = "center"),
                            (a.style.padding = "10px"),
                            (a.innerText = this.license)),
                        (l.innerText = this.localization("This project is powered by") + " ");
                    (c = this.createElement("a")), (c.href = "https://github.com/libretro/RetroArch"), (c.target = "_blank"), (c.innerText = "RetroArch"), l.appendChild(c), (e = this.createElement("a"));
                    (e.target = "_blank"),
                        (e.href = "https://github.com/libretro/RetroArch/blob/master/COPYING"),
                        (e.innerText = this.localization("View the RetroArch license here")),
                        c.appendChild(this.createElement("br")),
                        c.appendChild(e),
                        (o.style["text-align"] = "center"),
                        (o.style.padding = "10px"),
                        (o.innerText =
                            '                    GNU GENERAL PUBLIC LICENSE\n                       Version 3, 29 June 2007\n\n Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>\n Everyone is permitted to copy and distribute verbatim copies\n of this license document, but changing it is not allowed.\n\n                            Preamble\n\n  The GNU General Public License is a free, copyleft license for\nsoftware and other kinds of works.\n\n  The licenses for most software and other practical works are designed\nto take away your freedom to share and change the works.  By contrast,\nthe GNU General Public License is intended to guarantee your freedom to\nshare and change all versions of a program--to make sure it remains free\nsoftware for all its users.  We, the Free Software Foundation, use the\nGNU General Public License for most of our software; it applies also to\nany other work released this way by its authors.  You can apply it to\nyour programs, too.\n\n  When we speak of free software, we are referring to freedom, not\nprice.  Our General Public Licenses are designed to make sure that you\nhave the freedom to distribute copies of free software (and charge for\nthem if you wish), that you receive source code or can get it if you\nwant it, that you can change the software or use pieces of it in new\nfree programs, and that you know you can do these things.\n\n  To protect your rights, we need to prevent others from denying you\nthese rights or asking you to surrender the rights.  Therefore, you have\ncertain responsibilities if you distribute copies of the software, or if\nyou modify it: responsibilities to respect the freedom of others.\n\n  For example, if you distribute copies of such a program, whether\ngratis or for a fee, you must pass on to the recipients the same\nfreedoms that you received.  You must make sure that they, too, receive\nor can get the source code.  And you must show them these terms so they\nknow their rights.\n\n  Developers that use the GNU GPL protect your rights with two steps:\n(1) assert copyright on the software, and (2) offer you this License\ngiving you legal permission to copy, distribute and/or modify it.\n\n  For the developers\' and authors\' protection, the GPL clearly explains\nthat there is no warranty for this free software.  For both users\' and\nauthors\' sake, the GPL requires that modified versions be marked as\nchanged, so that their problems will not be attributed erroneously to\nauthors of previous versions.\n\n  Some devices are designed to deny users access to install or run\nmodified versions of the software inside them, although the manufacturer\ncan do so.  This is fundamentally incompatible with the aim of\nprotecting users\' freedom to change the software.  The systematic\npattern of such abuse occurs in the area of products for individuals to\nuse, which is precisely where it is most unacceptable.  Therefore, we\nhave designed this version of the GPL to prohibit the practice for those\nproducts.  If such problems arise substantially in other domains, we\nstand ready to extend this provision to those domains in future versions\nof the GPL, as needed to protect the freedom of users.\n\n  Finally, every program is threatened constantly by software patents.\nStates should not allow patents to restrict development and use of\nsoftware on general-purpose computers, but in those that do, we wish to\navoid the special danger that patents applied to a free program could\nmake it effectively proprietary.  To prevent this, the GPL assures that\npatents cannot be used to render the program non-free.\n\n  The precise terms and conditions for copying, distribution and\nmodification follow.\n\n                       TERMS AND CONDITIONS\n\n  0. Definitions.\n\n  "This License" refers to version 3 of the GNU General Public License.\n\n  "Copyright" also means copyright-like laws that apply to other kinds of\nworks, such as semiconductor masks.\n\n  "The Program" refers to any copyrightable work licensed under this\nLicense.  Each licensee is addressed as "you".  "Licensees" and\n"recipients" may be individuals or organizations.\n\n  To "modify" a work means to copy from or adapt all or part of the work\nin a fashion requiring copyright permission, other than the making of an\nexact copy.  The resulting work is called a "modified version" of the\nearlier work or a work "based on" the earlier work.\n\n  A "covered work" means either the unmodified Program or a work based\non the Program.\n\n  To "propagate" a work means to do anything with it that, without\npermission, would make you directly or secondarily liable for\ninfringement under applicable copyright law, except executing it on a\ncomputer or modifying a private copy.  Propagation includes copying,\ndistribution (with or without modification), making available to the\npublic, and in some countries other activities as well.\n\n  To "convey" a work means any kind of propagation that enables other\nparties to make or receive copies.  Mere interaction with a user through\na computer network, with no transfer of a copy, is not conveying.\n\n  An interactive user interface displays "Appropriate Legal Notices"\nto the extent that it includes a convenient and prominently visible\nfeature that (1) displays an appropriate copyright notice, and (2)\ntells the user that there is no warranty for the work (except to the\nextent that warranties are provided), that licensees may convey the\nwork under this License, and how to view a copy of this License.  If\nthe interface presents a list of user commands or options, such as a\nmenu, a prominent item in the list meets this criterion.\n\n  1. Source Code.\n\n  The "source code" for a work means the preferred form of the work\nfor making modifications to it.  "Object code" means any non-source\nform of a work.\n\n  A "Standard Interface" means an interface that either is an official\nstandard defined by a recognized standards body, or, in the case of\ninterfaces specified for a particular programming language, one that\nis widely used among developers working in that language.\n\n  The "System Libraries" of an executable work include anything, other\nthan the work as a whole, that (a) is included in the normal form of\npackaging a Major Component, but which is not part of that Major\nComponent, and (b) serves only to enable use of the work with that\nMajor Component, or to implement a Standard Interface for which an\nimplementation is available to the public in source code form.  A\n"Major Component", in this context, means a major essential component\n(kernel, window system, and so on) of the specific operating system\n(if any) on which the executable work runs, or a compiler used to\nproduce the work, or an object code interpreter used to run it.\n\n  The "Corresponding Source" for a work in object code form means all\nthe source code needed to generate, install, and (for an executable\nwork) run the object code and to modify the work, including scripts to\ncontrol those activities.  However, it does not include the work\'s\nSystem Libraries, or general-purpose tools or generally available free\nprograms which are used unmodified in performing those activities but\nwhich are not part of the work.  For example, Corresponding Source\nincludes interface definition files associated with source files for\nthe work, and the source code for shared libraries and dynamically\nlinked subprograms that the work is specifically designed to require,\nsuch as by intimate data communication or control flow between those\nsubprograms and other parts of the work.\n\n  The Corresponding Source need not include anything that users\ncan regenerate automatically from other parts of the Corresponding\nSource.\n\n  The Corresponding Source for a work in source code form is that\nsame work.\n\n  2. Basic Permissions.\n\n  All rights granted under this License are granted for the term of\ncopyright on the Program, and are irrevocable provided the stated\nconditions are met.  This License explicitly affirms your unlimited\npermission to run the unmodified Program.  The output from running a\ncovered work is covered by this License only if the output, given its\ncontent, constitutes a covered work.  This License acknowledges your\nrights of fair use or other equivalent, as provided by copyright law.\n\n  You may make, run and propagate covered works that you do not\nconvey, without conditions so long as your license otherwise remains\nin force.  You may convey covered works to others for the sole purpose\nof having them make modifications exclusively for you, or provide you\nwith facilities for running those works, provided that you comply with\nthe terms of this License in conveying all material for which you do\nnot control copyright.  Those thus making or running the covered works\nfor you must do so exclusively on your behalf, under your direction\nand control, on terms that prohibit them from making any copies of\nyour copyrighted material outside their relationship with you.\n\n  Conveying under any other circumstances is permitted solely under\nthe conditions stated below.  Sublicensing is not allowed; section 10\nmakes it unnecessary.\n\n  3. Protecting Users\' Legal Rights From Anti-Circumvention Law.\n\n  No covered work shall be deemed part of an effective technological\nmeasure under any applicable law fulfilling obligations under article\n11 of the WIPO copyright treaty adopted on 20 December 1996, or\nsimilar laws prohibiting or restricting circumvention of such\nmeasures.\n\n  When you convey a covered work, you waive any legal power to forbid\ncircumvention of technological measures to the extent such circumvention\nis effected by exercising rights under this License with respect to\nthe covered work, and you disclaim any intention to limit operation or\nmodification of the work as a means of enforcing, against the work\'s\nusers, your or third parties\' legal rights to forbid circumvention of\ntechnological measures.\n\n  4. Conveying Verbatim Copies.\n\n  You may convey verbatim copies of the Program\'s source code as you\nreceive it, in any medium, provided that you conspicuously and\nappropriately publish on each copy an appropriate copyright notice;\nkeep intact all notices stating that this License and any\nnon-permissive terms added in accord with section 7 apply to the code;\nkeep intact all notices of the absence of any warranty; and give all\nrecipients a copy of this License along with the Program.\n\n  You may charge any price or no price for each copy that you convey,\nand you may offer support or warranty protection for a fee.\n\n  5. Conveying Modified Source Versions.\n\n  You may convey a work based on the Program, or the modifications to\nproduce it from the Program, in the form of source code under the\nterms of section 4, provided that you also meet all of these conditions:\n\n    a) The work must carry prominent notices stating that you modified\n    it, and giving a relevant date.\n\n    b) The work must carry prominent notices stating that it is\n    released under this License and any conditions added under section\n    7.  This requirement modifies the requirement in section 4 to\n    "keep intact all notices".\n\n    c) You must license the entire work, as a whole, under this\n    License to anyone who comes into possession of a copy.  This\n    License will therefore apply, along with any applicable section 7\n    additional terms, to the whole of the work, and all its parts,\n    regardless of how they are packaged.  This License gives no\n    permission to license the work in any other way, but it does not\n    invalidate such permission if you have separately received it.\n\n    d) If the work has interactive user interfaces, each must display\n    Appropriate Legal Notices; however, if the Program has interactive\n    interfaces that do not display Appropriate Legal Notices, your\n    work need not make them do so.\n\n  A compilation of a covered work with other separate and independent\nworks, which are not by their nature extensions of the covered work,\nand which are not combined with it such as to form a larger program,\nin or on a volume of a storage or distribution medium, is called an\n"aggregate" if the compilation and its resulting copyright are not\nused to limit the access or legal rights of the compilation\'s users\nbeyond what the individual works permit.  Inclusion of a covered work\nin an aggregate does not cause this License to apply to the other\nparts of the aggregate.\n\n  6. Conveying Non-Source Forms.\n\n  You may convey a covered work in object code form under the terms\nof sections 4 and 5, provided that you also convey the\nmachine-readable Corresponding Source under the terms of this License,\nin one of these ways:\n\n    a) Convey the object code in, or embodied in, a physical product\n    (including a physical distribution medium), accompanied by the\n    Corresponding Source fixed on a durable physical medium\n    customarily used for software interchange.\n\n    b) Convey the object code in, or embodied in, a physical product\n    (including a physical distribution medium), accompanied by a\n    written offer, valid for at least three years and valid for as\n    long as you offer spare parts or customer support for that product\n    model, to give anyone who possesses the object code either (1) a\n    copy of the Corresponding Source for all the software in the\n    product that is covered by this License, on a durable physical\n    medium customarily used for software interchange, for a price no\n    more than your reasonable cost of physically performing this\n    conveying of source, or (2) access to copy the\n    Corresponding Source from a network server at no charge.\n\n    c) Convey individual copies of the object code with a copy of the\n    written offer to provide the Corresponding Source.  This\n    alternative is allowed only occasionally and noncommercially, and\n    only if you received the object code with such an offer, in accord\n    with subsection 6b.\n\n    d) Convey the object code by offering access from a designated\n    place (gratis or for a charge), and offer equivalent access to the\n    Corresponding Source in the same way through the same place at no\n    further charge.  You need not require recipients to copy the\n    Corresponding Source along with the object code.  If the place to\n    copy the object code is a network server, the Corresponding Source\n    may be on a different server (operated by you or a third party)\n    that supports equivalent copying facilities, provided you maintain\n    clear directions next to the object code saying where to find the\n    Corresponding Source.  Regardless of what server hosts the\n    Corresponding Source, you remain obligated to ensure that it is\n    available for as long as needed to satisfy these requirements.\n\n    e) Convey the object code using peer-to-peer transmission, provided\n    you inform other peers where the object code and Corresponding\n    Source of the work are being offered to the general public at no\n    charge under subsection 6d.\n\n  A separable portion of the object code, whose source code is excluded\nfrom the Corresponding Source as a System Library, need not be\nincluded in conveying the object code work.\n\n  A "User Product" is either (1) a "consumer product", which means any\ntangible personal property which is normally used for personal, family,\nor household purposes, or (2) anything designed or sold for incorporation\ninto a dwelling.  In determining whether a product is a consumer product,\ndoubtful cases shall be resolved in favor of coverage.  For a particular\nproduct received by a particular user, "normally used" refers to a\ntypical or common use of that class of product, regardless of the status\nof the particular user or of the way in which the particular user\nactually uses, or expects or is expected to use, the product.  A product\nis a consumer product regardless of whether the product has substantial\ncommercial, industrial or non-consumer uses, unless such uses represent\nthe only significant mode of use of the product.\n\n  "Installation Information" for a User Product means any methods,\nprocedures, authorization keys, or other information required to install\nand execute modified versions of a covered work in that User Product from\na modified version of its Corresponding Source.  The information must\nsuffice to ensure that the continued functioning of the modified object\ncode is in no case prevented or interfered with solely because\nmodification has been made.\n\n  If you convey an object code work under this section in, or with, or\nspecifically for use in, a User Product, and the conveying occurs as\npart of a transaction in which the right of possession and use of the\nUser Product is transferred to the recipient in perpetuity or for a\nfixed term (regardless of how the transaction is characterized), the\nCorresponding Source conveyed under this section must be accompanied\nby the Installation Information.  But this requirement does not apply\nif neither you nor any third party retains the ability to install\nmodified object code on the User Product (for example, the work has\nbeen installed in ROM).\n\n  The requirement to provide Installation Information does not include a\nrequirement to continue to provide support service, warranty, or updates\nfor a work that has been modified or installed by the recipient, or for\nthe User Product in which it has been modified or installed.  Access to a\nnetwork may be denied when the modification itself materially and\nadversely affects the operation of the network or violates the rules and\nprotocols for communication across the network.\n\n  Corresponding Source conveyed, and Installation Information provided,\nin accord with this section must be in a format that is publicly\ndocumented (and with an implementation available to the public in\nsource code form), and must require no special password or key for\nunpacking, reading or copying.\n\n  7. Additional Terms.\n\n  "Additional permissions" are terms that supplement the terms of this\nLicense by making exceptions from one or more of its conditions.\nAdditional permissions that are applicable to the entire Program shall\nbe treated as though they were included in this License, to the extent\nthat they are valid under applicable law.  If additional permissions\napply only to part of the Program, that part may be used separately\nunder those permissions, but the entire Program remains governed by\nthis License without regard to the additional permissions.\n\n  When you convey a copy of a covered work, you may at your option\nremove any additional permissions from that copy, or from any part of\nit.  (Additional permissions may be written to require their own\nremoval in certain cases when you modify the work.)  You may place\nadditional permissions on material, added by you to a covered work,\nfor which you have or can give appropriate copyright permission.\n\n  Notwithstanding any other provision of this License, for material you\nadd to a covered work, you may (if authorized by the copyright holders of\nthat material) supplement the terms of this License with terms:\n\n    a) Disclaiming warranty or limiting liability differently from the\n    terms of sections 15 and 16 of this License; or\n\n    b) Requiring preservation of specified reasonable legal notices or\n    author attributions in that material or in the Appropriate Legal\n    Notices displayed by works containing it; or\n\n    c) Prohibiting misrepresentation of the origin of that material, or\n    requiring that modified versions of such material be marked in\n    reasonable ways as different from the original version; or\n\n    d) Limiting the use for publicity purposes of names of licensors or\n    authors of the material; or\n\n    e) Declining to grant rights under trademark law for use of some\n    trade names, trademarks, or service marks; or\n\n    f) Requiring indemnification of licensors and authors of that\n    material by anyone who conveys the material (or modified versions of\n    it) with contractual assumptions of liability to the recipient, for\n    any liability that these contractual assumptions directly impose on\n    those licensors and authors.\n\n  All other non-permissive additional terms are considered "further\nrestrictions" within the meaning of section 10.  If the Program as you\nreceived it, or any part of it, contains a notice stating that it is\ngoverned by this License along with a term that is a further\nrestriction, you may remove that term.  If a license document contains\na further restriction but permits relicensing or conveying under this\nLicense, you may add to a covered work material governed by the terms\nof that license document, provided that the further restriction does\nnot survive such relicensing or conveying.\n\n  If you add terms to a covered work in accord with this section, you\nmust place, in the relevant source files, a statement of the\nadditional terms that apply to those files, or a notice indicating\nwhere to find the applicable terms.\n\n  Additional terms, permissive or non-permissive, may be stated in the\nform of a separately written license, or stated as exceptions;\nthe above requirements apply either way.\n\n  8. Termination.\n\n  You may not propagate or modify a covered work except as expressly\nprovided under this License.  Any attempt otherwise to propagate or\nmodify it is void, and will automatically terminate your rights under\nthis License (including any patent licenses granted under the third\nparagraph of section 11).\n\n  However, if you cease all violation of this License, then your\nlicense from a particular copyright holder is reinstated (a)\nprovisionally, unless and until the copyright holder explicitly and\nfinally terminates your license, and (b) permanently, if the copyright\nholder fails to notify you of the violation by some reasonable means\nprior to 60 days after the cessation.\n\n  Moreover, your license from a particular copyright holder is\nreinstated permanently if the copyright holder notifies you of the\nviolation by some reasonable means, this is the first time you have\nreceived notice of violation of this License (for any work) from that\ncopyright holder, and you cure the violation prior to 30 days after\nyour receipt of the notice.\n\n  Termination of your rights under this section does not terminate the\nlicenses of parties who have received copies or rights from you under\nthis License.  If your rights have been terminated and not permanently\nreinstated, you do not qualify to receive new licenses for the same\nmaterial under section 10.\n\n  9. Acceptance Not Required for Having Copies.\n\n  You are not required to accept this License in order to receive or\nrun a copy of the Program.  Ancillary propagation of a covered work\noccurring solely as a consequence of using peer-to-peer transmission\nto receive a copy likewise does not require acceptance.  However,\nnothing other than this License grants you permission to propagate or\nmodify any covered work.  These actions infringe copyright if you do\nnot accept this License.  Therefore, by modifying or propagating a\ncovered work, you indicate your acceptance of this License to do so.\n\n  10. Automatic Licensing of Downstream Recipients.\n\n  Each time you convey a covered work, the recipient automatically\nreceives a license from the original licensors, to run, modify and\npropagate that work, subject to this License.  You are not responsible\nfor enforcing compliance by third parties with this License.\n\n  An "entity transaction" is a transaction transferring control of an\norganization, or substantially all assets of one, or subdividing an\norganization, or merging organizations.  If propagation of a covered\nwork results from an entity transaction, each party to that\ntransaction who receives a copy of the work also receives whatever\nlicenses to the work the party\'s predecessor in interest had or could\ngive under the previous paragraph, plus a right to possession of the\nCorresponding Source of the work from the predecessor in interest, if\nthe predecessor has it or can get it with reasonable efforts.\n\n  You may not impose any further restrictions on the exercise of the\nrights granted or affirmed under this License.  For example, you may\nnot impose a license fee, royalty, or other charge for exercise of\nrights granted under this License, and you may not initiate litigation\n(including a cross-claim or counterclaim in a lawsuit) alleging that\nany patent claim is infringed by making, using, selling, offering for\nsale, or importing the Program or any portion of it.\n\n  11. Patents.\n\n  A "contributor" is a copyright holder who authorizes use under this\nLicense of the Program or a work on which the Program is based.  The\nwork thus licensed is called the contributor\'s "contributor version".\n\n  A contributor\'s "essential patent claims" are all patent claims\nowned or controlled by the contributor, whether already acquired or\nhereafter acquired, that would be infringed by some manner, permitted\nby this License, of making, using, or selling its contributor version,\nbut do not include claims that would be infringed only as a\nconsequence of further modification of the contributor version.  For\npurposes of this definition, "control" includes the right to grant\npatent sublicenses in a manner consistent with the requirements of\nthis License.\n\n  Each contributor grants you a non-exclusive, worldwide, royalty-free\npatent license under the contributor\'s essential patent claims, to\nmake, use, sell, offer for sale, import and otherwise run, modify and\npropagate the contents of its contributor version.\n\n  In the following three paragraphs, a "patent license" is any express\nagreement or commitment, however denominated, not to enforce a patent\n(such as an express permission to practice a patent or covenant not to\nsue for patent infringement).  To "grant" such a patent license to a\nparty means to make such an agreement or commitment not to enforce a\npatent against the party.\n\n  If you convey a covered work, knowingly relying on a patent license,\nand the Corresponding Source of the work is not available for anyone\nto copy, free of charge and under the terms of this License, through a\npublicly available network server or other readily accessible means,\nthen you must either (1) cause the Corresponding Source to be so\navailable, or (2) arrange to deprive yourself of the benefit of the\npatent license for this particular work, or (3) arrange, in a manner\nconsistent with the requirements of this License, to extend the patent\nlicense to downstream recipients.  "Knowingly relying" means you have\nactual knowledge that, but for the patent license, your conveying the\ncovered work in a country, or your recipient\'s use of the covered work\nin a country, would infringe one or more identifiable patents in that\ncountry that you have reason to believe are valid.\n\n  If, pursuant to or in connection with a single transaction or\narrangement, you convey, or propagate by procuring conveyance of, a\ncovered work, and grant a patent license to some of the parties\nreceiving the covered work authorizing them to use, propagate, modify\nor convey a specific copy of the covered work, then the patent license\nyou grant is automatically extended to all recipients of the covered\nwork and works based on it.\n\n  A patent license is "discriminatory" if it does not include within\nthe scope of its coverage, prohibits the exercise of, or is\nconditioned on the non-exercise of one or more of the rights that are\nspecifically granted under this License.  You may not convey a covered\nwork if you are a party to an arrangement with a third party that is\nin the business of distributing software, under which you make payment\nto the third party based on the extent of your activity of conveying\nthe work, and under which the third party grants, to any of the\nparties who would receive the covered work from you, a discriminatory\npatent license (a) in connection with copies of the covered work\nconveyed by you (or copies made from those copies), or (b) primarily\nfor and in connection with specific products or compilations that\ncontain the covered work, unless you entered into that arrangement,\nor that patent license was granted, prior to 28 March 2007.\n\n  Nothing in this License shall be construed as excluding or limiting\nany implied license or other defenses to infringement that may\notherwise be available to you under applicable patent law.\n\n  12. No Surrender of Others\' Freedom.\n\n  If conditions are imposed on you (whether by court order, agreement or\notherwise) that contradict the conditions of this License, they do not\nexcuse you from the conditions of this License.  If you cannot convey a\ncovered work so as to satisfy simultaneously your obligations under this\nLicense and any other pertinent obligations, then as a consequence you may\nnot convey it at all.  For example, if you agree to terms that obligate you\nto collect a royalty for further conveying from those to whom you convey\nthe Program, the only way you could satisfy both those terms and this\nLicense would be to refrain entirely from conveying the Program.\n\n  13. Use with the GNU Affero General Public License.\n\n  Notwithstanding any other provision of this License, you have\npermission to link or combine any covered work with a work licensed\nunder version 3 of the GNU Affero General Public License into a single\ncombined work, and to convey the resulting work.  The terms of this\nLicense will continue to apply to the part which is the covered work,\nbut the special requirements of the GNU Affero General Public License,\nsection 13, concerning interaction through a network will apply to the\ncombination as such.\n\n  14. Revised Versions of this License.\n\n  The Free Software Foundation may publish revised and/or new versions of\nthe GNU General Public License from time to time.  Such new versions will\nbe similar in spirit to the present version, but may differ in detail to\naddress new problems or concerns.\n\n  Each version is given a distinguishing version number.  If the\nProgram specifies that a certain numbered version of the GNU General\nPublic License "or any later version" applies to it, you have the\noption of following the terms and conditions either of that numbered\nversion or of any later version published by the Free Software\nFoundation.  If the Program does not specify a version number of the\nGNU General Public License, you may choose any version ever published\nby the Free Software Foundation.\n\n  If the Program specifies that a proxy can decide which future\nversions of the GNU General Public License can be used, that proxy\'s\npublic statement of acceptance of a version permanently authorizes you\nto choose that version for the Program.\n\n  Later license versions may give you additional or different\npermissions.  However, no additional obligations are imposed on any\nauthor or copyright holder as a result of your choosing to follow a\nlater version.\n\n  15. Disclaimer of Warranty.\n\n  THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY\nAPPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT\nHOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY\nOF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\nPURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM\nIS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF\nALL NECESSARY SERVICING, REPAIR OR CORRECTION.\n\n  16. Limitation of Liability.\n\n  IN NO EVENT UNLESS REQUIRED BY APPLICABLE LAW OR AGREED TO IN WRITING\nWILL ANY COPYRIGHT HOLDER, OR ANY OTHER PARTY WHO MODIFIES AND/OR CONVEYS\nTHE PROGRAM AS PERMITTED ABOVE, BE LIABLE TO YOU FOR DAMAGES, INCLUDING ANY\nGENERAL, SPECIAL, INCIDENTAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE\nUSE OR INABILITY TO USE THE PROGRAM (INCLUDING BUT NOT LIMITED TO LOSS OF\nDATA OR DATA BEING RENDERED INACCURATE OR LOSSES SUSTAINED BY YOU OR THIRD\nPARTIES OR A FAILURE OF THE PROGRAM TO OPERATE WITH ANY OTHER PROGRAMS),\nEVEN IF SUCH HOLDER OR OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF\nSUCH DAMAGES.\n\n  17. Interpretation of Sections 15 and 16.\n\n  If the disclaimer of warranty and limitation of liability provided\nabove cannot be given local legal effect according to their terms,\nreviewing courts shall apply local law that most closely approximates\nan absolute waiver of all civil liability in connection with the\nProgram, unless a warranty or assumption of liability accompanies a\ncopy of the Program in return for a fee.\n\n                     END OF TERMS AND CONDITIONS\n\n            How to Apply These Terms to Your New Programs\n\n  If you develop a new program, and you want it to be of the greatest\npossible use to the public, the best way to achieve this is to make it\nfree software which everyone can redistribute and change under these terms.\n\n  To do so, attach the following notices to the program.  It is safest\nto attach them to the start of each source file to most effectively\nstate the exclusion of warranty; and each file should have at least\nthe "copyright" line and a pointer to where the full notice is found.\n\n    EmulatorJS: RetroArch on the web\n    Copyright (C) 2022-2024  Ethan O\'Brien\n\n    This program is free software: you can redistribute it and/or modify\n    it under the terms of the GNU General Public License as published by\n    the Free Software Foundation, either version 3 of the License, or\n    (at your option) any later version.\n\n    This program is distributed in the hope that it will be useful,\n    but WITHOUT ANY WARRANTY; without even the implied warranty of\n    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n    GNU General Public License for more details.\n\n    You should have received a copy of the GNU General Public License\n    along with this program.  If not, see <https://www.gnu.org/licenses/>.\n\nAlso add information on how to contact you by electronic and paper mail.\n\n  If the program does terminal interaction, make it output a short\nnotice like this when it starts in an interactive mode:\n\n    EmulatorJS  Copyright (C) 2023  Ethan O\'Brien\n    This program comes with ABSOLUTELY NO WARRANTY; for details type `show w\'.\n    This is free software, and you are welcome to redistribute it\n    under certain conditions; type `show c\' for details.\n\nThe hypothetical commands `show w\' and `show c\' should show the appropriate\nparts of the General Public License.  Of course, your program\'s commands\nmight be different; for a GUI interface, you would use an "about box".\n\n  You should also get your employer (if you work as a programmer) or school,\nif any, to sign a "copyright disclaimer" for the program, if necessary.\nFor more information on this, and how to apply and follow the GNU GPL, see\n<https://www.gnu.org/licenses/>.\n\n  The GNU General Public License does not permit incorporating your program\ninto proprietary programs.  If your program is a subroutine library, you\nmay consider it more useful to permit linking proprietary applications with\nthe library.  If this is what you want to do, use the GNU Lesser General\nPublic License instead of this License.  But first, please read\n<https://www.gnu.org/licenses/why-not-lgpl.html>.\n');
                }),
                this.config.buttonOpts &&
                    (!1 === this.config.buttonOpts.screenshot && t.setAttribute("hidden", ""),
                    !1 === this.config.buttonOpts.screenRecord && o.setAttribute("hidden", ""),
                    !1 === this.config.buttonOpts.quickSave && a.setAttribute("hidden", ""),
                    !1 === this.config.buttonOpts.quickLoad) &&
                    r.setAttribute("hidden", ""),
                this.elements.contextmenu.appendChild(s),
                this.elements.parent.appendChild(this.elements.contextmenu);
        }
        closePopup() {
            if (null !== this.currentPopup) {
                try {
                    this.currentPopup.remove();
                } catch (e) {}
                this.currentPopup = null;
            }
        }
        createPopup(e, i, t) {
            t || this.closePopup();
            var n = this.createElement("div"),
                s = (n.classList.add("ejs_popup_container"), this.elements.parent.appendChild(n), this.createElement("h4")),
                e = ((s.innerText = this.localization(e)), this.createElement("div")),
                s = (e.classList.add("ejs_popup_body"), n.appendChild(s), n.appendChild(e), this.createElement("div"));
            (s.style["padding-top"] = "10px"), n.appendChild(s);
            for (let t in i) {
                var o = this.createElement("a");
                i[t] instanceof Function &&
                    o.addEventListener("click", (e) => {
                        i[t](), e.preventDefault();
                    }),
                    o.classList.add("ejs_button"),
                    (o.innerText = this.localization(t)),
                    n.appendChild(o);
            }
            return t ? (n.style.display = "none") : (this.currentPopup = n), e;
        }
        selectFile() {
            return new Promise((t, e) => {
                var i = this.createElement("input");
                (i.type = "file"),
                    this.addEventListener(i, "change", (e) => {
                        t(e.target.files[0]);
                    }),
                    i.click();
            });
        }
        isPopupOpen() {
            return "none" !== this.cheatMenu.style.display || "none" !== this.netplayMenu.style.display || "none" !== this.controlMenu.style.display || null !== this.currentPopup;
        }
        isChild(e, t) {
            var i;
            return !(!e || !t) && ((i = 9 === e.nodeType ? e.documentElement : e), e === t || (i.contains ? i.contains(t) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(t)));
        }
        createBottomMenuBar() {
            (this.elements.menu = this.createElement("div")),
                (this.elements.menu.style.opacity = 0),
                this.on("start", (e) => {
                    this.elements.menu.style.opacity = "";
                }),
                this.elements.menu.classList.add("ejs_menu_bar"),
                this.elements.menu.classList.add("ejs_menu_bar_hidden");
            let t = null,
                i = !1,
                n = () => {
                    this.paused || this.settingsMenuOpen || this.disksMenuOpen || this.elements.menu.classList.add("ejs_menu_bar_hidden");
                };
            this.addEventListener(this.elements.parent, "mousemove click", (e) => {
                "touch" === e.pointerType || !this.started || i || document.pointerLockElement === this.canvas || this.isPopupOpen() || (clearTimeout(t), (t = setTimeout(n, 3e3)), this.elements.menu.classList.remove("ejs_menu_bar_hidden"));
            }),
                (this.menu = {
                    close: () => {
                        clearTimeout(t), this.elements.menu.classList.add("ejs_menu_bar_hidden");
                    },
                    open: (e) => {
                        (!this.started && !0 !== e) || (clearTimeout(t), !0 !== e && (t = setTimeout(n, 3e3)), this.elements.menu.classList.remove("ejs_menu_bar_hidden"));
                    },
                    toggle: () => {
                        this.started && (clearTimeout(t), this.elements.menu.classList.contains("ejs_menu_bar_hidden") && (t = setTimeout(n, 3e3)), this.elements.menu.classList.toggle("ejs_menu_bar_hidden"));
                    },
                }),
                this.elements.parent.appendChild(this.elements.menu);
            let s,
                a =
                    (this.addEventListener(this.elements.parent, "mousedown touchstart", (e) => {
                        this.isChild(this.elements.menu, e.target) ||
                            this.isChild(this.elements.menuToggle, e.target) ||
                            !this.started ||
                            this.elements.menu.classList.contains("ejs_menu_bar_hidden") ||
                            this.isPopupOpen() ||
                            575 < this.elements.parent.getBoundingClientRect().width ||
                            (clearTimeout(s),
                            (s = setTimeout(() => {
                                i = !1;
                            }, 2e3)),
                            (i = !0),
                            this.menu.close());
                    }),
                    !1);
            var e = (e, t, i, n, s) => {
                var o = this.createElement("button"),
                    l = ((o.type = "button"), document.createElementNS("http://www.w3.org/2000/svg", "svg")),
                    t = (l.setAttribute("role", "presentation"), l.setAttribute("focusable", "false"), (l.innerHTML = t), this.createElement("span"));
                return (
                    (t.innerText = this.localization(e)),
                    a && t.classList.add("ejs_menu_text_right"),
                    t.classList.add("ejs_menu_text"),
                    o.classList.add("ejs_menu_button"),
                    o.appendChild(l),
                    o.appendChild(t),
                    (n || this.elements.menu).appendChild(o),
                    i instanceof Function && this.addEventListener(o, "click", i),
                    s ? [o, l, t] : o
                );
            };
            let o = e(
                    "Restart",
                    '<svg viewBox="0 0 512 512"><path d="M496 48V192c0 17.69-14.31 32-32 32H320c-17.69 0-32-14.31-32-32s14.31-32 32-32h63.39c-29.97-39.7-77.25-63.78-127.6-63.78C167.7 96.22 96 167.9 96 256s71.69 159.8 159.8 159.8c34.88 0 68.03-11.03 95.88-31.94c14.22-10.53 34.22-7.75 44.81 6.375c10.59 14.16 7.75 34.22-6.375 44.81c-39.03 29.28-85.36 44.86-134.2 44.86C132.5 479.9 32 379.4 32 256s100.5-223.9 223.9-223.9c69.15 0 134 32.47 176.1 86.12V48c0-17.69 14.31-32 32-32S496 30.31 496 48z"/></svg>',
                    () => {
                        this.isNetplay && this.netplay.owner ? (this.gameManager.restart(), this.netplay.reset(), this.netplay.sendMessage({ restart: !0 }), this.play()) : this.isNetplay || this.gameManager.restart();
                    }
                ),
                l = e(
                    "Pause",
                    '<svg viewBox="0 0 320 512"><path d="M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"/></svg>',
                    () => {
                        this.isNetplay && this.netplay.owner ? (this.pause(), this.gameManager.saveSaveFiles(), this.netplay.sendMessage({ pause: !0 })) : this.isNetplay || this.pause();
                    }
                ),
                r = e(
                    "Play",
                    '<svg viewBox="0 0 320 512"><path d="M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"/></svg>',
                    () => {
                        this.isNetplay && this.netplay.owner ? (this.play(), this.netplay.sendMessage({ play: !0 })) : this.isNetplay || this.play();
                    }
                );
            (r.style.display = "none"),
                (this.togglePlaying = (e) => {
                    (this.paused = !this.paused),
                        e || (this.paused ? ((l.style.display = "none"), (r.style.display = "")) : ((l.style.display = ""), (r.style.display = "none"))),
                        this.gameManager.toggleMainLoop(this.paused ? 0 : 1),
                        this.enableMouseLock && (this.canvas.exitPointerLock ? this.canvas.exitPointerLock() : this.canvas.mozExitPointerLock && this.canvas.mozExitPointerLock());
                }),
                (this.play = (e) => {
                    this.paused && this.togglePlaying(e);
                }),
                (this.pause = (e) => {
                    this.paused || this.togglePlaying(e);
                });
            let c,
                d = e(
                    "Save State",
                    '<svg viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"/></svg>',
                    async () => {
                        var e = this.gameManager.getState();
                        0 < this.callEvent("saveState", { screenshot: await this.gameManager.screenshot(), state: e }) ||
                            (c && URL.revokeObjectURL(c),
                            "browser" === this.settings["save-state-location"] && this.saveInBrowserSupported()
                                ? (this.storage.states.put(this.getBaseFileName() + ".state", e), this.displayMessage(this.localization("SAVE SAVED TO BROWSER")))
                                : ((e = new Blob([e])), (c = URL.createObjectURL(e)), ((e = this.createElement("a")).href = c), (e.download = this.getBaseFileName() + ".state"), e.click()));
                    }
                ),
                g = e(
                    "Load State",
                    '<svg viewBox="0 0 576 512"><path fill="currentColor" d="M572.694 292.093L500.27 416.248A63.997 63.997 0 0 1 444.989 448H45.025c-18.523 0-30.064-20.093-20.731-36.093l72.424-124.155A64 64 0 0 1 152 256h399.964c18.523 0 30.064 20.093 20.73 36.093zM152 224h328v-48c0-26.51-21.49-48-48-48H272l-64-64H48C21.49 64 0 85.49 0 112v278.046l69.077-118.418C86.214 242.25 117.989 224 152 224z"/></svg>',
                    async () => {
                        var e;
                        0 < this.callEvent("loadState") ||
                            ("browser" === this.settings["save-state-location"] && this.saveInBrowserSupported()
                                ? this.storage.states.get(this.getBaseFileName() + ".state").then((e) => {
                                      this.gameManager.loadState(e), this.displayMessage(this.localization("SAVE LOADED FROM BROWSER"));
                                  })
                                : ((e = await this.selectFile()), (e = new Uint8Array(await e.arrayBuffer())), this.gameManager.loadState(e)));
                    }
                ),
                h = e(
                    "Control Settings",
                    '<svg viewBox="0 0 640 512"><path fill="currentColor" d="M480 96H160C71.6 96 0 167.6 0 256s71.6 160 160 160c44.8 0 85.2-18.4 114.2-48h91.5c29 29.6 69.5 48 114.2 48 88.4 0 160-71.6 160-160S568.4 96 480 96zM256 276c0 6.6-5.4 12-12 12h-52v52c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-52H76c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h52v-52c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h52c6.6 0 12 5.4 12 12v40zm184 68c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-80c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"/></svg>',
                    () => {
                        this.controlMenu.style.display = "";
                    }
                ),
                p = e(
                    "Cheats",
                    '<svg viewBox="0 0 496 512"><path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm4 72.6c-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.7-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8-10.1-8.4-25.3-7.1-33.8 3.1z" class=""></path></svg>',
                    () => {
                        this.cheatMenu.style.display = "";
                    }
                ),
                u = e(
                    "Cache Manager",
                    '<svg viewBox="0 0 1800 1800"><path d="M896 768q237 0 443-43t325-127v170q0 69-103 128t-280 93.5-385 34.5-385-34.5T231 896 128 768V598q119 84 325 127t443 43zm0 768q237 0 443-43t325-127v170q0 69-103 128t-280 93.5-385 34.5-385-34.5-280-93.5-103-128v-170q119 84 325 127t443 43zm0-384q237 0 443-43t325-127v170q0 69-103 128t-280 93.5-385 34.5-385-34.5-280-93.5-103-128V982q119 84 325 127t443 43zM896 0q208 0 385 34.5t280 93.5 103 128v128q0 69-103 128t-280 93.5T896 640t-385-34.5T231 512 128 384V256q0-69 103-128t280-93.5T896 0z"/></svg>',
                    () => {
                        this.openCacheMenu();
                    }
                );
            this.config.disableDatabases && (u.style.display = "none");
            let m,
                I = e(
                    "Export Save File",
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 23 23"><path d="M3 6.5V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M8 3H16V8.4C16 8.73137 15.7314 9 15.4 9H8.6C8.26863 9 8 8.73137 8 8.4V3Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M18 21V13.6C18 13.2686 17.7314 13 17.4 13H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M6 21V17.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M12 12H1M1 12L4 9M1 12L4 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
                    async () => {
                        var e = await this.gameManager.getSaveFile();
                        0 < this.callEvent("saveSave", { screenshot: await this.gameManager.screenshot(), save: e }) ||
                            ((e = new Blob([e])), (m = URL.createObjectURL(e)), ((e = this.createElement("a")).href = m), (e.download = this.gameManager.getSaveFilePath().split("/").pop()), e.click());
                    }
                ),
                C = e(
                    "Import Save File",
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 23 23"><path d="M3 7.5V5C3 3.89543 3.89543 3 5 3H16.1716C16.702 3 17.2107 3.21071 17.5858 3.58579L20.4142 6.41421C20.7893 6.78929 21 7.29799 21 7.82843V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M6 21V17" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 21V13.6C18 13.2686 17.7314 13 17.4 13H15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M16 3V8.4C16 8.73137 15.7314 9 15.4 9H13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="transparent"></path><path d="M8 3V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M1 12H12M12 12L9 9M12 12L9 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
                    async () => {
                        var e = this.callEvent("loadSave");
                        if (!(0 < e)) {
                            var e = await this.selectFile(),
                                e = new Uint8Array(await e.arrayBuffer()),
                                i = this.gameManager.getSaveFilePath(),
                                n = i.split("/");
                            let t = "";
                            for (let e = 0; e < n.length - 1; e++) "" === n[e] || ((t += "/" + n[e]), this.gameManager.FS.analyzePath(t).exists) || this.gameManager.FS.mkdir(t);
                            this.gameManager.FS.analyzePath(i).exists && this.gameManager.FS.unlink(i), this.gameManager.FS.writeFile(i, e), this.gameManager.loadSaveFiles();
                        }
                    }
                ),
                y = e(
                    "Netplay",
                    '<svg viewBox="0 0 512 512"><path fill="currentColor" d="M364.215 192h131.43c5.439 20.419 8.354 41.868 8.354 64s-2.915 43.581-8.354 64h-131.43c5.154-43.049 4.939-86.746 0-128zM185.214 352c10.678 53.68 33.173 112.514 70.125 151.992.221.001.44.008.661.008s.44-.008.661-.008c37.012-39.543 59.467-98.414 70.125-151.992H185.214zm174.13-192h125.385C452.802 84.024 384.128 27.305 300.95 12.075c30.238 43.12 48.821 96.332 58.394 147.925zm-27.35 32H180.006c-5.339 41.914-5.345 86.037 0 128h151.989c5.339-41.915 5.345-86.037-.001-128zM152.656 352H27.271c31.926 75.976 100.6 132.695 183.778 147.925-30.246-43.136-48.823-96.35-58.393-147.925zm206.688 0c-9.575 51.605-28.163 104.814-58.394 147.925 83.178-15.23 151.852-71.949 183.778-147.925H359.344zm-32.558-192c-10.678-53.68-33.174-112.514-70.125-151.992-.221 0-.44-.008-.661-.008s-.44.008-.661.008C218.327 47.551 195.872 106.422 185.214 160h141.572zM16.355 192C10.915 212.419 8 233.868 8 256s2.915 43.581 8.355 64h131.43c-4.939-41.254-5.154-84.951 0-128H16.355zm136.301-32c9.575-51.602 28.161-104.81 58.394-147.925C127.872 27.305 59.198 84.024 27.271 160h125.385z"/></svg>',
                    async () => {
                        this.openNetplayMenu();
                    }
                );
            var b = this.createElement("span"),
                b = (b.classList.add("ejs_menu_bar_spacer"), this.elements.menu.appendChild(b), (a = !0), this.createElement("div"));
            b.classList.add("ejs_volume_parent");
            let Z = e(
                    "Mute",
                    '<svg viewBox="0 0 640 512"><path d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 255.1c0 14.17-6.5 27.59-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 255.1S435.1 200.4 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 255.1s-19.44 82.1-53.31 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 255.1S518.2 145 473.1 108.2zM534.4 33.4c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 116.3 592 183.9 592 255.1s-32.09 139.7-88.06 185.5c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 481 512.2 484 519.2 484c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 255.1S601.5 88.34 534.4 33.4zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"/></svg>',
                    () => {
                        (Z.style.display = "none"), (V.style.display = ""), (this.muted = !0), this.setVolume(0);
                    },
                    b
                ),
                V = e(
                    "Unmute",
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M301.2 34.85c-11.5-5.188-25.02-3.122-34.44 5.253L131.8 160H48c-26.51 0-48 21.49-48 47.1v95.1c0 26.51 21.49 47.1 48 47.1h83.84l134.9 119.9c5.984 5.312 13.58 8.094 21.26 8.094c4.438 0 8.972-.9375 13.17-2.844c11.5-5.156 18.82-16.56 18.82-29.16V64C319.1 51.41 312.7 40 301.2 34.85zM513.9 255.1l47.03-47.03c9.375-9.375 9.375-24.56 0-33.94s-24.56-9.375-33.94 0L480 222.1L432.1 175c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l47.03 47.03l-47.03 47.03c-9.375 9.375-9.375 24.56 0 33.94c9.373 9.373 24.56 9.381 33.94 0L480 289.9l47.03 47.03c9.373 9.373 24.56 9.381 33.94 0c9.375-9.375 9.375-24.56 0-33.94L513.9 255.1z"/></svg>',
                    () => {
                        0 === this.volume && (this.volume = 0.5), (Z.style.display = ""), (V.style.display = "none"), (this.muted = !1), this.setVolume(this.volume);
                    },
                    b
                ),
                B = ((V.style.display = "none"), this.createElement("input")),
                S =
                    (B.setAttribute("data-range", "volume"),
                    B.setAttribute("type", "range"),
                    B.setAttribute("min", 0),
                    B.setAttribute("max", 1),
                    B.setAttribute("step", 0.01),
                    B.setAttribute("autocomplete", "off"),
                    B.setAttribute("role", "slider"),
                    B.setAttribute("aria-label", "Volume"),
                    B.setAttribute("aria-valuemin", 0),
                    B.setAttribute("aria-valuemax", 100),
                    (this.setVolume = (t) => {
                        this.saveSettings(),
                            (this.muted = 0 === t),
                            (B.value = t),
                            B.setAttribute("aria-valuenow", 100 * t),
                            B.setAttribute("aria-valuetext", (100 * t).toFixed(1) + "%"),
                            B.setAttribute("style", "--value: " + 100 * t + "%;margin-left: 5px;position: relative;z-index: 2;"),
                            this.Module.AL &&
                                this.Module.AL.currentCtx &&
                                this.Module.AL.currentCtx.sources &&
                                this.Module.AL.currentCtx.sources.forEach((e) => {
                                    e.gain.gain.value = t;
                                }),
                            (this.config.buttonOpts && !1 === this.config.buttonOpts.mute) || ((V.style.display = 0 === t ? "" : "none"), (Z.style.display = 0 === t ? "none" : ""));
                    }),
                    this.addEventListener(B, "change mousemove touchmove mousedown touchstart mouseup", (e) => {
                        setTimeout(() => {
                            var e = parseFloat(B.value);
                            (0 === e && this.muted) || ((this.volume = e), this.setVolume(this.volume));
                        }, 5);
                    }),
                    (this.config.buttonOpts && !1 === this.config.buttonOpts.volume) || b.appendChild(B),
                    this.elements.menu.appendChild(b),
                    e(
                        "Context Menu",
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">\x3c!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--\x3e<path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg>',
                        () => {
                            "none" === this.elements.contextmenu.style.display
                                ? ((this.elements.contextmenu.style.display = "block"),
                                  (this.elements.contextmenu.style.left = getComputedStyle(this.elements.parent).width.split("px")[0] / 2 - getComputedStyle(this.elements.contextmenu).width.split("px")[0] / 2 + "px"),
                                  (this.elements.contextmenu.style.top = getComputedStyle(this.elements.parent).height.split("px")[0] / 2 - getComputedStyle(this.elements.contextmenu).height.split("px")[0] / 2 + "px"),
                                  setTimeout(this.menu.close.bind(this), 20))
                                : (this.elements.contextmenu.style.display = "none");
                        }
                    )),
                f =
                    ((this.diskParent = this.createElement("div")),
                    (this.diskParent.id = "ejs_disksMenu"),
                    (this.disksMenuOpen = !1),
                    e(
                        "Disks",
                        '<svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 473.109 473.109"><path d="M340.963,101.878H12.105C5.423,101.878,0,107.301,0,113.983v328.862c0,6.68,5.423,12.105,12.105,12.105h328.857 c6.685,0,12.104-5.426,12.104-12.105V113.983C353.067,107.301,347.647,101.878,340.963,101.878z M67.584,120.042h217.895v101.884 H67.584V120.042z M296.076,429.228H56.998V278.414h239.079V429.228z M223.947,135.173h30.269v72.638h-30.269V135.173z M274.13,315.741H78.933v-12.105H274.13V315.741z M274.13,358.109H78.933v-12.105H274.13V358.109z M274.13,398.965H78.933v-12.105 H274.13V398.965z M473.109,30.263v328.863c0,6.68-5.426,12.105-12.105,12.105H384.59v-25.724h31.528V194.694H384.59v-56.489h20.93 V36.321H187.625v43.361h-67.583v-49.42c0-6.682,5.423-12.105,12.105-12.105H461.01C467.695,18.158,473.109,23.581,473.109,30.263z M343.989,51.453h30.269v31.321c-3.18-1.918-6.868-3.092-10.853-3.092h-19.416V51.453z M394.177,232.021h-9.581v-12.105h9.581 V232.021z M384.59,262.284h9.581v12.105h-9.581V262.284z M384.59,303.14h9.581v12.104h-9.581V303.14z"/></svg>',
                        () => {
                            (this.disksMenuOpen = !this.disksMenuOpen),
                                f[1].classList.toggle("ejs_svg_rotate", this.disksMenuOpen),
                                (this.disksMenu.style.display = this.disksMenuOpen ? "" : "none"),
                                f[2].classList.toggle("ejs_disks_text", this.disksMenuOpen);
                        },
                        this.diskParent,
                        !0
                    )),
                A =
                    (this.elements.menu.appendChild(this.diskParent),
                    (this.closeDisksMenu = () => {
                        this.disksMenu && ((this.disksMenuOpen = !1), f[1].classList.toggle("ejs_svg_rotate", this.disksMenuOpen), f[2].classList.toggle("ejs_disks_text", this.disksMenuOpen), (this.disksMenu.style.display = "none"));
                    }),
                    this.addEventListener(this.elements.parent, "mousedown touchstart", (e) => {
                        this.isChild(this.disksMenu, e.target) || ("touch" !== e.pointerType && e.target !== f[0] && e.target !== f[2] && this.closeDisksMenu());
                    }),
                    (this.settingParent = this.createElement("div")),
                    (this.settingsMenuOpen = !1),
                    e(
                        "Settings",
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6C499.2 175.2 496.4 184.9 489.6 191.2L446.3 230.6C447.4 238.9 448 247.4 448 256C448 264.6 447.4 273.1 446.3 281.4L489.6 320.8C496.4 327.1 499.2 336.8 495.9 345.4C491.5 357.3 486.2 368.8 480.2 379.7L475.5 387.8C468.9 398.8 461.5 409.2 453.4 419.1C447.4 426.2 437.7 428.7 428.9 425.9L373.2 408.1C359.8 418.4 344.1 427 329.2 433.6L316.7 490.7C314.7 499.7 307.7 506.1 298.5 508.5C284.7 510.8 270.5 512 255.1 512C241.5 512 227.3 510.8 213.5 508.5C204.3 506.1 197.3 499.7 195.3 490.7L182.8 433.6C167 427 152.2 418.4 138.8 408.1L83.14 425.9C74.3 428.7 64.55 426.2 58.63 419.1C50.52 409.2 43.12 398.8 36.52 387.8L31.84 379.7C25.77 368.8 20.49 357.3 16.06 345.4C12.82 336.8 15.55 327.1 22.41 320.8L65.67 281.4C64.57 273.1 64 264.6 64 256C64 247.4 64.57 238.9 65.67 230.6L22.41 191.2C15.55 184.9 12.82 175.3 16.06 166.6C20.49 154.7 25.78 143.2 31.84 132.3L36.51 124.2C43.12 113.2 50.52 102.8 58.63 92.95C64.55 85.8 74.3 83.32 83.14 86.14L138.8 103.9C152.2 93.56 167 84.96 182.8 78.43L195.3 21.33C197.3 12.25 204.3 5.04 213.5 3.51C227.3 1.201 241.5 0 256 0C270.5 0 284.7 1.201 298.5 3.51C307.7 5.04 314.7 12.25 316.7 21.33L329.2 78.43C344.1 84.96 359.8 93.56 373.2 103.9L428.9 86.14C437.7 83.32 447.4 85.8 453.4 92.95C461.5 102.8 468.9 113.2 475.5 124.2L480.2 132.3C486.2 143.2 491.5 154.7 495.9 166.6V166.6zM256 336C300.2 336 336 300.2 336 255.1C336 211.8 300.2 175.1 256 175.1C211.8 175.1 176 211.8 176 255.1C176 300.2 211.8 336 256 336z"/></svg>',
                        () => {
                            (this.settingsMenuOpen = !this.settingsMenuOpen),
                                A[1].classList.toggle("ejs_svg_rotate", this.settingsMenuOpen),
                                (this.settingsMenu.style.display = this.settingsMenuOpen ? "" : "none"),
                                A[2].classList.toggle("ejs_settings_text", this.settingsMenuOpen);
                        },
                        this.settingParent,
                        !0
                    )),
                v =
                    (this.elements.menu.appendChild(this.settingParent),
                    (this.closeSettingsMenu = () => {
                        this.settingsMenu &&
                            ((this.settingsMenuOpen = !1), A[1].classList.toggle("ejs_svg_rotate", this.settingsMenuOpen), A[2].classList.toggle("ejs_settings_text", this.settingsMenuOpen), (this.settingsMenu.style.display = "none"));
                    }),
                    this.addEventListener(this.elements.parent, "mousedown touchstart", (e) => {
                        this.isChild(this.settingsMenu, e.target) || ("touch" !== e.pointerType && e.target !== A[0] && e.target !== A[2] && this.closeSettingsMenu());
                    }),
                    this.addEventListener(this.canvas, "click", (e) => {
                        "touch" !== e.pointerType &&
                            this.enableMouseLock &&
                            !this.paused &&
                            (this.canvas.requestPointerLock ? this.canvas.requestPointerLock() : this.canvas.mozRequestPointerLock && this.canvas.mozRequestPointerLock(), this.menu.close());
                    }),
                    e(
                        "Enter Fullscreen",
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M208 281.4c-12.5-12.5-32.76-12.5-45.26-.002l-78.06 78.07l-30.06-30.06c-6.125-6.125-14.31-9.367-22.63-9.367c-4.125 0-8.279 .7891-12.25 2.43c-11.97 4.953-19.75 16.62-19.75 29.56v135.1C.0013 501.3 10.75 512 24 512h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-30.06-30.06l78.06-78.07c12.5-12.49 12.5-32.75 .002-45.25L208 281.4zM487.1 0h-136c-12.94 0-24.63 7.797-29.56 19.75c-4.969 11.97-2.219 25.72 6.938 34.87l30.06 30.06l-78.06 78.07c-12.5 12.5-12.5 32.76 0 45.26l22.62 22.62c12.5 12.5 32.76 12.5 45.26 0l78.06-78.07l30.06 30.06c9.156 9.141 22.87 11.84 34.87 6.937C504.2 184.6 512 172.9 512 159.1V23.1C512 10.74 501.3 0 487.1 0z"/></svg>',
                        () => {
                            this.toggleFullscreen(!0);
                        }
                    )),
                w = e(
                    "Exit Fullscreen",
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M215.1 272h-136c-12.94 0-24.63 7.797-29.56 19.75C45.47 303.7 48.22 317.5 57.37 326.6l30.06 30.06l-78.06 78.07c-12.5 12.5-12.5 32.75-.0012 45.25l22.62 22.62c12.5 12.5 32.76 12.5 45.26 .0013l78.06-78.07l30.06 30.06c6.125 6.125 14.31 9.367 22.63 9.367c4.125 0 8.279-.7891 12.25-2.43c11.97-4.953 19.75-16.62 19.75-29.56V296C239.1 282.7 229.3 272 215.1 272zM296 240h136c12.94 0 24.63-7.797 29.56-19.75c4.969-11.97 2.219-25.72-6.938-34.87l-30.06-30.06l78.06-78.07c12.5-12.5 12.5-32.76 .0002-45.26l-22.62-22.62c-12.5-12.5-32.76-12.5-45.26-.0003l-78.06 78.07l-30.06-30.06c-9.156-9.141-22.87-11.84-34.87-6.937c-11.97 4.953-19.75 16.62-19.75 29.56v135.1C272 229.3 282.7 240 296 240z"/></svg>',
                    () => {
                        this.toggleFullscreen(!1);
                    }
                ),
                U =
                    ((w.style.display = "none"),
                    !(this.toggleFullscreen = (e) => {
                        if (e) {
                            if (
                                (this.elements.parent.requestFullscreen
                                    ? this.elements.parent.requestFullscreen()
                                    : this.elements.parent.mozRequestFullScreen
                                    ? this.elements.parent.mozRequestFullScreen()
                                    : this.elements.parent.webkitRequestFullscreen
                                    ? this.elements.parent.webkitRequestFullscreen()
                                    : this.elements.parent.msRequestFullscreen && this.elements.parent.msRequestFullscreen(),
                                (w.style.display = ""),
                                (v.style.display = "none"),
                                this.isMobile)
                            )
                                try {
                                    screen.orientation.lock("nds" === this.getCore(!0) ? "portrait" : "landscape").catch((e) => {});
                                } catch (e) {}
                        } else if (
                            (document.exitFullscreen
                                ? document.exitFullscreen()
                                : document.webkitExitFullscreen
                                ? document.webkitExitFullscreen()
                                : document.mozCancelFullScreen
                                ? document.mozCancelFullScreen()
                                : document.msExitFullscreen && document.msExitFullscreen(),
                            (w.style.display = "none"),
                            (v.style.display = ""),
                            this.isMobile)
                        )
                            try {
                                screen.orientation.unlock();
                            } catch (e) {}
                    })),
                N = e(
                    "Exit EmulatorJS",
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 460"><path style="fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke:rgb(255,255,255);stroke-opacity:1;stroke-miterlimit:4;" d="M 14.000061 7.636414 L 14.000061 4.5 C 14.000061 4.223877 13.776123 3.999939 13.5 3.999939 L 4.5 3.999939 C 4.223877 3.999939 3.999939 4.223877 3.999939 4.5 L 3.999939 19.5 C 3.999939 19.776123 4.223877 20.000061 4.5 20.000061 L 13.5 20.000061 C 13.776123 20.000061 14.000061 19.776123 14.000061 19.5 L 14.000061 16.363586 " transform="matrix(21.333333,0,0,21.333333,0,0)"/><path style="fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke:rgb(255,255,255);stroke-opacity:1;stroke-miterlimit:4;" d="M 9.999939 12 L 21 12 M 21 12 L 18.000366 8.499939 M 21 12 L 18 15.500061 " transform="matrix(21.333333,0,0,21.333333,0,0)"/></svg>',
                    async () => {
                        if (!U) {
                            U = !0;
                            let t = this.createSubPopup();
                            this.game.appendChild(t[0]), t[1].classList.add("ejs_cheat_parent"), (t[1].style.width = "100%");
                            var e = t[1],
                                i = this.createElement("div"),
                                n = (i.classList.add("ejs_cheat_header"), this.createElement("h2")),
                                s = ((n.innerText = this.localization("Are you sure you want to exit?")), n.classList.add("ejs_cheat_heading"), this.createElement("button")),
                                n =
                                    (s.classList.add("ejs_cheat_close"),
                                    i.appendChild(n),
                                    i.appendChild(s),
                                    e.appendChild(i),
                                    this.addEventListener(s, "click", (e) => {
                                        (U = !1), t[0].remove();
                                    }),
                                    e.appendChild(this.createElement("br")),
                                    this.createElement("footer")),
                                i = this.createElement("button"),
                                s = this.createElement("button"),
                                o =
                                    ((i.innerText = this.localization("Exit")),
                                    (s.innerText = this.localization("Cancel")),
                                    i.classList.add("ejs_button_button"),
                                    s.classList.add("ejs_button_button"),
                                    i.classList.add("ejs_popup_submit"),
                                    s.classList.add("ejs_popup_submit"),
                                    (i.style["background-color"] = "rgba(var(--ejs-primary-color),1)"),
                                    n.appendChild(i),
                                    this.createElement("span"));
                            (o.innerText = " "),
                                n.appendChild(o),
                                n.appendChild(s),
                                e.appendChild(n),
                                this.addEventListener(s, "click", (e) => {
                                    t[0].remove(), (U = !1);
                                }),
                                this.addEventListener(i, "click", (e) => {
                                    t[0].remove();
                                    this.createPopup("EmulatorJS has exited", {});
                                    this.callEvent("exit");
                                }),
                                setTimeout(this.menu.close.bind(this), 20);
                        }
                    }
                );
            this.addEventListener(document, "webkitfullscreenchange mozfullscreenchange fullscreenchange", (e) => {
                e.target === this.elements.parent && (null === document.fullscreenElement ? ((w.style.display = "none"), (v.style.display = "")) : ((w.style.display = ""), (v.style.display = "none")));
            }),
                this.elements.parent.requestFullscreen ||
                    this.elements.parent.mozRequestFullScreen ||
                    this.elements.parent.webkitRequestFullscreen ||
                    this.elements.parent.msRequestFullscreen ||
                    ((w.style.display = "none"), (v.style.display = "none")),
                (this.elements.bottomBar = {
                    playPause: [l, r],
                    restart: [o],
                    settings: [A],
                    contextMenu: [S],
                    fullscreen: [v, w],
                    saveState: [d],
                    loadState: [g],
                    gamepad: [h],
                    cheat: [p],
                    cacheManager: [u],
                    saveSavFiles: [I],
                    loadSavFiles: [C],
                    netplay: [y],
                    exit: [N],
                }),
                this.config.buttonOpts &&
                    (this.debug && console.log(this.config.buttonOpts),
                    !1 === this.config.buttonOpts.playPause && ((l.style.display = "none"), (r.style.display = "none")),
                    !1 === this.config.buttonOpts.contextMenuButton && !1 !== this.config.buttonOpts.rightClick && !1 === this.isMobile && (S.style.display = "none"),
                    !1 === this.config.buttonOpts.restart && (o.style.display = "none"),
                    !1 === this.config.buttonOpts.settings && (A[0].style.display = "none"),
                    !1 === this.config.buttonOpts.fullscreen && ((v.style.display = "none"), (w.style.display = "none")),
                    !1 === this.config.buttonOpts.mute && ((Z.style.display = "none"), (V.style.display = "none")),
                    !1 === this.config.buttonOpts.saveState && (d.style.display = "none"),
                    !1 === this.config.buttonOpts.loadState && (g.style.display = "none"),
                    !1 === this.config.buttonOpts.saveSavFiles && (I.style.display = "none"),
                    !1 === this.config.buttonOpts.loadSavFiles && (C.style.display = "none"),
                    !1 === this.config.buttonOpts.gamepad && (h.style.display = "none"),
                    !1 === this.config.buttonOpts.cheat && (p.style.display = "none"),
                    !1 === this.config.buttonOpts.cacheManager && (u.style.display = "none"),
                    !1 === this.config.buttonOpts.netplay && (y.style.display = "none"),
                    !1 === this.config.buttonOpts.diskButton && (f[0].style.display = "none"),
                    !1 === this.config.buttonOpts.volumeSlider && (B.style.display = "none"),
                    !1 === this.config.buttonOpts.exitEmulation) &&
                    (N.style.display = "none"),
                (this.menu.failedToStart = () => {
                    this.config.buttonOpts || (this.config.buttonOpts = {}),
                        (this.config.buttonOpts.mute = !1),
                        (A[0].style.display = ""),
                        (l.style.display = "none"),
                        (r.style.display = "none"),
                        (S.style.display = "none"),
                        (o.style.display = "none"),
                        (v.style.display = "none"),
                        (w.style.display = "none"),
                        (Z.style.display = "none"),
                        (V.style.display = "none"),
                        (d.style.display = "none"),
                        (g.style.display = "none"),
                        (I.style.display = "none"),
                        (C.style.display = "none"),
                        (h.style.display = "none"),
                        (p.style.display = "none"),
                        (u.style.display = "none"),
                        (y.style.display = "none"),
                        (f[0].style.display = "none"),
                        (B.style.display = "none"),
                        (N.style.display = "none"),
                        (this.elements.menu.style.opacity = ""),
                        this.menu.open(!0);
                });
        }
        openCacheMenu() {
            (async () => {
                var e = this.createElement("table");
                let i = this.createElement("tbody");
                var t = this.createPopup("Cache Manager", {
                        "Clear All": async () => {
                            for (var e in await this.storage.rom.getSizes()) await this.storage.rom.remove(e);
                            i.innerHTML = "";
                        },
                        Close: () => {
                            this.closePopup();
                        },
                    }),
                    n = await this.storage.rom.getSizes();
                (e.style.width = "100%"), (e.style["padding-left"] = "10px"), (e.style["text-align"] = "left"), t.appendChild(e), e.appendChild(i);
                for (let t in n) {
                    let e = this.createElement("tr");
                    var s = this.createElement("td"),
                        o = this.createElement("td"),
                        l = this.createElement("td"),
                        a =
                            ((l.style.cursor = "pointer"),
                            (s.innerText = t),
                            (o.innerText = ((e) => {
                                let t = -1;
                                for (; (e /= 1024), t++, 1024 < e; );
                                return Math.max(e, 0.1).toFixed(1) + [" kB", " MB", " GB", " TB", "PB", "EB", "ZB", "YB"][t];
                            })(n[t])),
                            this.createElement("a"));
                    (a.innerText = this.localization("Remove")),
                        this.addEventListener(l, "click", () => {
                            this.storage.rom.remove(t), e.remove();
                        }),
                        l.appendChild(a),
                        e.appendChild(s),
                        e.appendChild(o),
                        e.appendChild(l),
                        i.appendChild(e);
                }
            })();
        }
        getControlScheme() {
            return this.config.controlScheme && "string" == typeof this.config.controlScheme ? this.config.controlScheme : this.getCore(!0);
        }
        createControlSettingMenu() {
            let e = [];
            (this.checkGamepadInputs = () => e.forEach((e) => e())), (this.gamepadLabels = []), (this.controls = JSON.parse(JSON.stringify(this.defaultControllers)));
            var t = this.createPopup(
                "Control Settings",
                {
                    Reset: () => {
                        (this.controls = JSON.parse(JSON.stringify(this.defaultControllers))), this.setupKeys(), this.checkGamepadInputs(), this.saveSettings();
                    },
                    Clear: () => {
                        (this.controls = { 0: {}, 1: {}, 2: {}, 3: {} }), this.setupKeys(), this.checkGamepadInputs(), this.saveSettings();
                    },
                    Close: () => {
                        this.controlMenu.style.display = "none";
                    },
                },
                !0
            );
            this.setupKeys(), (this.controlMenu = t.parentElement), t.classList.add("ejs_control_body");
            let l;
            if (
                ((l =
                    "gb" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "nes" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 10, label: this.localization("EJECT") },
                              { id: 11, label: this.localization("SWAP DISKS") },
                          ]
                        : "snes" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 9, label: this.localization("X") },
                              { id: 1, label: this.localization("Y") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                          ]
                        : "n64" === this.getControlScheme()
                        ? [
                              { id: 0, label: this.localization("A") },
                              { id: 1, label: this.localization("B") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("D-PAD UP") },
                              { id: 5, label: this.localization("D-PAD DOWN") },
                              { id: 6, label: this.localization("D-PAD LEFT") },
                              { id: 7, label: this.localization("D-PAD RIGHT") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 12, label: this.localization("Z") },
                              { id: 19, label: this.localization("STICK UP") },
                              { id: 18, label: this.localization("STICK DOWN") },
                              { id: 17, label: this.localization("STICK LEFT") },
                              { id: 16, label: this.localization("STICK RIGHT") },
                              { id: 23, label: this.localization("C-PAD UP") },
                              { id: 22, label: this.localization("C-PAD DOWN") },
                              { id: 21, label: this.localization("C-PAD LEFT") },
                              { id: 20, label: this.localization("C-PAD RIGHT") },
                          ]
                        : "gba" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "nds" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 9, label: this.localization("X") },
                              { id: 1, label: this.localization("Y") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 14, label: this.localization("Microphone") },
                          ]
                        : "vb" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("LEFT D-PAD UP") },
                              { id: 5, label: this.localization("LEFT D-PAD DOWN") },
                              { id: 6, label: this.localization("LEFT D-PAD LEFT") },
                              { id: 7, label: this.localization("LEFT D-PAD RIGHT") },
                              { id: 19, label: this.localization("RIGHT D-PAD UP") },
                              { id: 18, label: this.localization("RIGHT D-PAD DOWN") },
                              { id: 17, label: this.localization("RIGHT D-PAD LEFT") },
                              { id: 16, label: this.localization("RIGHT D-PAD RIGHT") },
                          ]
                        : ["segaMD", "segaCD", "sega32x"].includes(this.getControlScheme())
                        ? [
                              { id: 1, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 8, label: this.localization("C") },
                              { id: 10, label: this.localization("X") },
                              { id: 9, label: this.localization("Y") },
                              { id: 11, label: this.localization("Z") },
                              { id: 3, label: this.localization("START") },
                              { id: 2, label: this.localization("MODE") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "segaMS" === this.getControlScheme()
                        ? [
                              { id: 0, label: this.localization("BUTTON 1 / START") },
                              { id: 8, label: this.localization("BUTTON 2") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "segaGG" === this.getControlScheme()
                        ? [
                              { id: 0, label: this.localization("BUTTON 1") },
                              { id: 8, label: this.localization("BUTTON 2") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "segaSaturn" === this.getControlScheme()
                        ? [
                              { id: 1, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 8, label: this.localization("C") },
                              { id: 9, label: this.localization("X") },
                              { id: 10, label: this.localization("Y") },
                              { id: 11, label: this.localization("Z") },
                              { id: 12, label: this.localization("L") },
                              { id: 13, label: this.localization("R") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "3do" === this.getControlScheme()
                        ? [
                              { id: 1, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 8, label: this.localization("C") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 2, label: this.localization("X") },
                              { id: 3, label: this.localization("P") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "atari2600" === this.getControlScheme()
                        ? [
                              { id: 0, label: this.localization("FIRE") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("RESET") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 10, label: this.localization("LEFT DIFFICULTY A") },
                              { id: 12, label: this.localization("LEFT DIFFICULTY B") },
                              { id: 11, label: this.localization("RIGHT DIFFICULTY A") },
                              { id: 13, label: this.localization("RIGHT DIFFICULTY B") },
                              { id: 14, label: this.localization("COLOR") },
                              { id: 15, label: this.localization("B/W") },
                          ]
                        : "atari7800" === this.getControlScheme()
                        ? [
                              { id: 0, label: this.localization("BUTTON 1") },
                              { id: 8, label: this.localization("BUTTON 2") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("PAUSE") },
                              { id: 9, label: this.localization("RESET") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 10, label: this.localization("LEFT DIFFICULTY") },
                              { id: 11, label: this.localization("RIGHT DIFFICULTY") },
                          ]
                        : "lynx" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 10, label: this.localization("OPTION 1") },
                              { id: 11, label: this.localization("OPTION 2") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "jaguar" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 1, label: this.localization("C") },
                              { id: 2, label: this.localization("PAUSE") },
                              { id: 3, label: this.localization("OPTION") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "pce" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("I") },
                              { id: 0, label: this.localization("II") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("RUN") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "ngp" === this.getControlScheme()
                        ? [
                              { id: 0, label: this.localization("A") },
                              { id: 8, label: this.localization("B") },
                              { id: 3, label: this.localization("OPTION") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "ws" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("A") },
                              { id: 0, label: this.localization("B") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("X UP") },
                              { id: 5, label: this.localization("X DOWN") },
                              { id: 6, label: this.localization("X LEFT") },
                              { id: 7, label: this.localization("X RIGHT") },
                              { id: 13, label: this.localization("Y UP") },
                              { id: 12, label: this.localization("Y DOWN") },
                              { id: 10, label: this.localization("Y LEFT") },
                              { id: 11, label: this.localization("Y RIGHT") },
                          ]
                        : "coleco" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("LEFT BUTTON") },
                              { id: 0, label: this.localization("RIGHT BUTTON") },
                              { id: 9, label: this.localization("1") },
                              { id: 1, label: this.localization("2") },
                              { id: 11, label: this.localization("3") },
                              { id: 10, label: this.localization("4") },
                              { id: 13, label: this.localization("5") },
                              { id: 12, label: this.localization("6") },
                              { id: 15, label: this.localization("7") },
                              { id: 14, label: this.localization("8") },
                              { id: 2, label: this.localization("*") },
                              { id: 3, label: this.localization("#") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "pcfx" === this.getControlScheme()
                        ? [
                              { id: 8, label: this.localization("I") },
                              { id: 0, label: this.localization("II") },
                              { id: 9, label: this.localization("III") },
                              { id: 1, label: this.localization("IV") },
                              { id: 10, label: this.localization("V") },
                              { id: 11, label: this.localization("VI") },
                              { id: 3, label: this.localization("RUN") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 12, label: this.localization("MODE1") },
                              { id: 13, label: this.localization("MODE2") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                          ]
                        : "psp" === this.getControlScheme()
                        ? [
                              { id: 9, label: this.localization("△") },
                              { id: 1, label: this.localization("□") },
                              { id: 0, label: this.localization("ｘ") },
                              { id: 8, label: this.localization("○") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 19, label: this.localization("STICK UP") },
                              { id: 18, label: this.localization("STICK DOWN") },
                              { id: 17, label: this.localization("STICK LEFT") },
                              { id: 16, label: this.localization("STICK RIGHT") },
                          ]
                        : [
                              { id: 0, label: this.localization("B") },
                              { id: 1, label: this.localization("Y") },
                              { id: 2, label: this.localization("SELECT") },
                              { id: 3, label: this.localization("START") },
                              { id: 4, label: this.localization("UP") },
                              { id: 5, label: this.localization("DOWN") },
                              { id: 6, label: this.localization("LEFT") },
                              { id: 7, label: this.localization("RIGHT") },
                              { id: 8, label: this.localization("A") },
                              { id: 9, label: this.localization("X") },
                              { id: 10, label: this.localization("L") },
                              { id: 11, label: this.localization("R") },
                              { id: 12, label: this.localization("L2") },
                              { id: 13, label: this.localization("R2") },
                              { id: 14, label: this.localization("L3") },
                              { id: 15, label: this.localization("R3") },
                              { id: 19, label: this.localization("L STICK UP") },
                              { id: 18, label: this.localization("L STICK DOWN") },
                              { id: 17, label: this.localization("L STICK LEFT") },
                              { id: 16, label: this.localization("L STICK RIGHT") },
                              { id: 23, label: this.localization("R STICK UP") },
                              { id: 22, label: this.localization("R STICK DOWN") },
                              { id: 21, label: this.localization("R STICK LEFT") },
                              { id: 20, label: this.localization("R STICK RIGHT") },
                          ]),
                ["arcade", "mame"].includes(this.getControlScheme()))
            )
                for (var i in l) 2 === l[i].id && (l[i].label = this.localization("INSERT COIN"));
            l.push(
                { id: 24, label: this.localization("QUICK SAVE STATE") },
                { id: 25, label: this.localization("QUICK LOAD STATE") },
                { id: 26, label: this.localization("CHANGE STATE SLOT") },
                { id: 27, label: this.localization("FAST FORWARD") },
                { id: 29, label: this.localization("SLOW MOTION") },
                { id: 28, label: this.localization("REWIND") }
            );
            var n = [];
            for (let e = 0; e < l.length; e++) n.push(l[e].id);
            for (let e = 0; e < 30; e++)
                n.includes(e) ||
                    (delete this.defaultControllers[0][e],
                    delete this.defaultControllers[1][e],
                    delete this.defaultControllers[2][e],
                    delete this.defaultControllers[3][e],
                    delete this.controls[0][e],
                    delete this.controls[1][e],
                    delete this.controls[2][e],
                    delete this.controls[3][e]);
            let s,
                o = [],
                a = [];
            var r = this.createElement("ul");
            r.classList.add("ejs_control_player_bar");
            for (let t = 1; t < 5; t++) {
                var c = this.createElement("li"),
                    d = (c.classList.add("tabs-title"), c.setAttribute("role", "presentation"), this.createElement("a"));
                (d.innerText = this.localization("Player") + " " + t),
                    d.setAttribute("role", "tab"),
                    d.setAttribute("aria-controls", "controls-" + (t - 1)),
                    d.setAttribute("aria-selected", "false"),
                    (d.id = "controls-" + (t - 1) + "-label"),
                    this.addEventListener(d, "click", (e) => {
                        e.preventDefault(), o[s].classList.remove("ejs_control_selected"), a[s].setAttribute("hidden", ""), (s = t - 1), o[t - 1].classList.add("ejs_control_selected"), a[t - 1].removeAttribute("hidden");
                    }),
                    c.appendChild(d),
                    r.appendChild(c),
                    o.push(c);
            }
            t.appendChild(r);
            var g = this.createElement("div");
            for (let o = 0; o < 4; o++) {
                this.controls[o] || (this.controls[o] = {});
                var h,
                    p = this.createElement("div"),
                    u = this.createElement("div"),
                    m = this.createElement("div"),
                    I = ((m.style = "font-size:12px;"), (m.innerText = this.localization("Connected Gamepad") + ": "), this.createElement("span")),
                    I = (this.gamepadLabels.push(I), (I.innerText = "n/a"), m.appendChild(I), this.createElement("div")),
                    C = ((I.style = "width:25%;float:left;"), (I.innerHTML = "&nbsp;"), this.createElement("div")),
                    y = ((C.style = "font-size:12px;width:50%;float:left;"), this.createElement("div")),
                    y = ((y.style = "text-align:center;width:50%;float:left;"), (y.innerText = this.localization("Gamepad")), C.appendChild(y), this.createElement("div")),
                    y = ((y.style = "text-align:center;width:50%;float:left;"), (y.innerText = this.localization("Keyboard")), C.appendChild(y), this.createElement("div"));
                if (((y.style = "clear:both;"), u.appendChild(m), u.appendChild(I), u.appendChild(C), (this.touch || 0 < navigator.maxTouchPoints) && 0 === o)) {
                    m = this.createElement("div");
                    (m.style = "width:25%;float:right;clear:none;padding:0;font-size: 11px;padding-left: 2.25rem;"), m.classList.add("ejs_control_row"), m.classList.add("ejs_cheat_row");
                    let t = this.createElement("input");
                    (t.type = "checkbox"), (t.checked = !0), (t.value = "o"), (t.id = "ejs_vp"), m.appendChild(t);
                    I = this.createElement("label");
                    (I.for = "ejs_vp"),
                        (I.innerText = "Virtual Gamepad"),
                        m.appendChild(I),
                        I.addEventListener("click", (e) => {
                            (t.checked = !t.checked), this.changeSettingOption("virtual-gamepad", t.checked ? "enabled" : "disabled");
                        }),
                        this.on("start", (e) => {
                            "disabled" === this.settings["virtual-gamepad"] && (t.checked = !1);
                        }),
                        u.appendChild(m);
                }
                for (h in (u.appendChild(y), p.appendChild(u), l)) {
                    let t = l[h].id,
                        i = l[h].label;
                    var b = this.createElement("div"),
                        Z = (b.setAttribute("data-id", t), b.setAttribute("data-index", o), b.setAttribute("data-label", i), (b.style = "margin-bottom:10px;"), b.classList.add("ejs_control_bar"), this.createElement("div")),
                        V = ((Z.style = "width:25%;float:left;font-size:12px;"), this.createElement("label")),
                        V = ((V.innerText = i + ":"), Z.appendChild(V), this.createElement("div")),
                        B = ((V.style = "width:50%;float:left;"), this.createElement("div"));
                    B.style = "width:50%;float:left;padding: 0 5px;";
                    let n = this.createElement("input");
                    (n.style = "text-align:center;height:25px;width: 100%;"), (n.type = "text"), n.setAttribute("readonly", ""), n.setAttribute("placeholder", ""), B.appendChild(n);
                    var S = this.createElement("div");
                    S.style = "width:50%;float:left;padding: 0 5px;";
                    let s = this.createElement("input");
                    if (
                        ((s.style = "text-align:center;height:25px;width: 100%;"),
                        (s.type = "text"),
                        s.setAttribute("readonly", ""),
                        s.setAttribute("placeholder", ""),
                        S.appendChild(s),
                        e.push(() => {
                            var e;
                            if (
                                ((s.value = ""),
                                (n.value = ""),
                                this.controls[o][t] && void 0 !== this.controls[o][t].value && ((e = this.keyMap[this.controls[o][t].value]), (e = this.localization(e)), (s.value = e)),
                                this.controls[o][t] && void 0 !== this.controls[o][t].value2 && "" !== this.controls[o][t].value2)
                            ) {
                                let e = this.controls[o][t].value2.toString();
                                (e = e.includes(":") ? ((e = e.split(":")), this.localization(e[0]) + ":" + this.localization(e[1])) : isNaN(e) ? this.localization(e) : this.localization("BUTTON") + " " + this.localization(e)),
                                    (n.value = e);
                            }
                        }),
                        this.controls[o][t] && this.controls[o][t].value && ((f = this.keyMap[this.controls[o][t].value]), (f = this.localization(f)), (s.value = f)),
                        this.controls[o][t] && this.controls[o][t].value2)
                    ) {
                        let e = this.controls[o][t].value2.toString();
                        (e = e.includes(":") ? ((e = e.split(":")), this.localization(e[0]) + ":" + this.localization(e[1])) : isNaN(e) ? this.localization(e) : this.localization("BUTTON") + " " + this.localization(e)), (n.value = e);
                    }
                    V.appendChild(B), V.appendChild(S);
                    var f = this.createElement("div"),
                        B = ((f.style = "clear:both;"), V.appendChild(f), this.createElement("div")),
                        S = ((B.style = "width:25%;float:left;"), this.createElement("a")),
                        S = (S.classList.add("ejs_control_set_button"), (S.innerText = this.localization("Set")), B.appendChild(S), this.createElement("div"));
                    (S.style = "clear:both;"),
                        b.appendChild(Z),
                        b.appendChild(V),
                        b.appendChild(B),
                        b.appendChild(S),
                        p.appendChild(b),
                        this.addEventListener(b, "mousedown", (e) => {
                            e.preventDefault(),
                                this.controlPopup.parentElement.parentElement.removeAttribute("hidden"),
                                (this.controlPopup.innerText = "[ " + i + " ]\n" + this.localization("Press Keyboard")),
                                this.controlPopup.setAttribute("button-num", t),
                                this.controlPopup.setAttribute("player-num", o);
                        });
                }
                g.appendChild(p), p.setAttribute("hidden", ""), a.push(p);
            }
            t.appendChild(g), (s = 0), o[0].classList.add("ejs_control_selected"), a[0].removeAttribute("hidden");
            t = this.createElement("div");
            t.classList.add("ejs_popup_container");
            let A = this.createElement("div");
            this.addEventListener(t, "mousedown click touchstart", (e) => {
                this.isChild(A, e.target) || this.controlPopup.parentElement.parentElement.setAttribute("hidden", "");
            });
            var v = this.createElement("a"),
                w =
                    (v.classList.add("ejs_control_set_button"),
                    (v.innerText = this.localization("Clear")),
                    this.addEventListener(v, "mousedown click touchstart", (e) => {
                        var t = this.controlPopup.getAttribute("button-num"),
                            i = this.controlPopup.getAttribute("player-num");
                        this.controls[i][t] || (this.controls[i][t] = {}),
                            (this.controls[i][t].value = 0),
                            (this.controls[i][t].value2 = ""),
                            this.controlPopup.parentElement.parentElement.setAttribute("hidden", ""),
                            this.checkGamepadInputs(),
                            this.saveSettings();
                    }),
                    A.classList.add("ejs_popup_box"),
                    (A.innerText = ""),
                    t.setAttribute("hidden", ""),
                    this.createElement("div"));
            (this.controlPopup = w), t.appendChild(A), A.appendChild(w), A.appendChild(this.createElement("br")), A.appendChild(v), this.controlMenu.appendChild(t);
        }
        initControlVars() {
            (this.defaultControllers = {
                0: {
                    0: { value: "x", value2: "BUTTON_2" },
                    1: { value: "s", value2: "BUTTON_4" },
                    2: { value: "v", value2: "SELECT" },
                    3: { value: "enter", value2: "START" },
                    4: { value: "up arrow", value2: "DPAD_UP" },
                    5: { value: "down arrow", value2: "DPAD_DOWN" },
                    6: { value: "left arrow", value2: "DPAD_LEFT" },
                    7: { value: "right arrow", value2: "DPAD_RIGHT" },
                    8: { value: "z", value2: "BUTTON_1" },
                    9: { value: "a", value2: "BUTTON_3" },
                    10: { value: "q", value2: "LEFT_TOP_SHOULDER" },
                    11: { value: "e", value2: "RIGHT_TOP_SHOULDER" },
                    12: { value: "tab", value2: "LEFT_BOTTOM_SHOULDER" },
                    13: { value: "r", value2: "RIGHT_BOTTOM_SHOULDER" },
                    14: { value: "", value2: "LEFT_STICK" },
                    15: { value: "", value2: "RIGHT_STICK" },
                    16: { value: "h", value2: "LEFT_STICK_X:+1" },
                    17: { value: "f", value2: "LEFT_STICK_X:-1" },
                    18: { value: "g", value2: "LEFT_STICK_Y:+1" },
                    19: { value: "t", value2: "LEFT_STICK_Y:-1" },
                    20: { value: "l", value2: "RIGHT_STICK_X:+1" },
                    21: { value: "j", value2: "RIGHT_STICK_X:-1" },
                    22: { value: "k", value2: "RIGHT_STICK_Y:+1" },
                    23: { value: "i", value2: "RIGHT_STICK_Y:-1" },
                    24: { value: "1" },
                    25: { value: "2" },
                    26: { value: "3" },
                    27: {},
                    28: {},
                    29: {},
                },
                1: {},
                2: {},
                3: {},
            }),
                (this.keyMap = {
                    0: "",
                    8: "backspace",
                    9: "tab",
                    13: "enter",
                    16: "shift",
                    17: "ctrl",
                    18: "alt",
                    19: "pause/break",
                    20: "caps lock",
                    27: "escape",
                    32: "space",
                    33: "page up",
                    34: "page down",
                    35: "end",
                    36: "home",
                    37: "left arrow",
                    38: "up arrow",
                    39: "right arrow",
                    40: "down arrow",
                    45: "insert",
                    46: "delete",
                    48: "0",
                    49: "1",
                    50: "2",
                    51: "3",
                    52: "4",
                    53: "5",
                    54: "6",
                    55: "7",
                    56: "8",
                    57: "9",
                    65: "a",
                    66: "b",
                    67: "c",
                    68: "d",
                    69: "e",
                    70: "f",
                    71: "g",
                    72: "h",
                    73: "i",
                    74: "j",
                    75: "k",
                    76: "l",
                    77: "m",
                    78: "n",
                    79: "o",
                    80: "p",
                    81: "q",
                    82: "r",
                    83: "s",
                    84: "t",
                    85: "u",
                    86: "v",
                    87: "w",
                    88: "x",
                    89: "y",
                    90: "z",
                    91: "left window key",
                    92: "right window key",
                    93: "select key",
                    96: "numpad 0",
                    97: "numpad 1",
                    98: "numpad 2",
                    99: "numpad 3",
                    100: "numpad 4",
                    101: "numpad 5",
                    102: "numpad 6",
                    103: "numpad 7",
                    104: "numpad 8",
                    105: "numpad 9",
                    106: "multiply",
                    107: "add",
                    109: "subtract",
                    110: "decimal point",
                    111: "divide",
                    112: "f1",
                    113: "f2",
                    114: "f3",
                    115: "f4",
                    116: "f5",
                    117: "f6",
                    118: "f7",
                    119: "f8",
                    120: "f9",
                    121: "f10",
                    122: "f11",
                    123: "f12",
                    144: "num lock",
                    145: "scroll lock",
                    186: "semi-colon",
                    187: "equal sign",
                    188: "comma",
                    189: "dash",
                    190: "period",
                    191: "forward slash",
                    192: "grave accent",
                    219: "open bracket",
                    220: "back slash",
                    221: "close braket",
                    222: "single quote",
                });
        }
        setupKeys() {
            for (let t = 0; t < 4; t++)
                for (let e = 0; e < 30; e++)
                    this.controls[t][e] &&
                        ((this.controls[t][e].value = parseInt(this.keyLookup(this.controls[t][e].value))), -1 === this.controls[t][e].value) &&
                        this.debug &&
                        (delete this.controls[t][e].value, console.warn("Invalid key for control " + e + " player " + t));
        }
        keyLookup(e) {
            if (void 0 === e) return 0;
            if ("number" == typeof e) return e;
            e = e.toString().toLowerCase();
            var t = Object.values(this.keyMap);
            return t.includes(e) ? ((t = t.indexOf(e)), Object.keys(this.keyMap)[t]) : -1;
        }
        keyChange(i) {
            var e, t;
            if (!i.repeat && this.started)
                if (null === this.controlPopup.parentElement.parentElement.getAttribute("hidden"))
                    (e = this.controlPopup.getAttribute("button-num")),
                        (t = this.controlPopup.getAttribute("player-num")),
                        this.controls[t][e] || (this.controls[t][e] = {}),
                        (this.controls[t][e].value = i.keyCode),
                        this.controlPopup.parentElement.parentElement.setAttribute("hidden", ""),
                        this.checkGamepadInputs(),
                        this.saveSettings();
                else if ("none" === this.settingsMenu.style.display && !this.isPopupOpen()) {
                    i.preventDefault();
                    var n = [16, 17, 18, 19, 20, 21, 22, 23];
                    for (let t = 0; t < 4; t++) for (let e = 0; e < 30; e++) this.controls[t][e] && this.controls[t][e].value === i.keyCode && this.gameManager.simulateInput(t, e, "keyup" === i.type ? 0 : n.includes(e) ? 32767 : 1);
                }
        }
        gamepadEvent(i) {
            if (this.started) {
                var e,
                    t,
                    n = 0.5 < (e = i.value || 0) || e < -0.5 ? (0 < e ? 1 : -1) : 0;
                if (null === this.controlPopup.parentElement.parentElement.getAttribute("hidden"))
                    return "buttonup" === i.type || ("axischanged" === i.type && 0 == n) || ((e = this.controlPopup.getAttribute("button-num")), (t = parseInt(this.controlPopup.getAttribute("player-num"))), i.gamepadIndex !== t)
                        ? void 0
                        : (this.controls[t][e] || (this.controls[t][e] = {}),
                          (this.controls[t][e].value2 = i.label),
                          this.controlPopup.parentElement.parentElement.setAttribute("hidden", ""),
                          this.checkGamepadInputs(),
                          void this.saveSettings());
                if ("none" === this.settingsMenu.style.display && !this.isPopupOpen()) {
                    var s,
                        o = [16, 17, 18, 19, 20, 21, 22, 23];
                    for (let t = 0; t < 4; t++)
                        if (i.gamepadIndex === t)
                            for (let e = 0; e < 30; e++)
                                this.controls[t][e] &&
                                    void 0 !== this.controls[t][e].value2 &&
                                    ((s = this.controls[t][e].value2),
                                    !["buttonup", "buttondown"].includes(i.type) || (s !== i.label && s !== i.index)
                                        ? "axischanged" === i.type &&
                                          "string" == typeof s &&
                                          s.split(":")[0] === i.axis &&
                                          (o.includes(e)
                                              ? "LEFT_STICK_X" === i.axis
                                                  ? 0 < i.value
                                                      ? (this.gameManager.simulateInput(t, 16, 32767 * i.value), this.gameManager.simulateInput(t, 17, 0))
                                                      : (this.gameManager.simulateInput(t, 17, -32767 * i.value), this.gameManager.simulateInput(t, 16, 0))
                                                  : "LEFT_STICK_Y" === i.axis
                                                  ? 0 < i.value
                                                      ? (this.gameManager.simulateInput(t, 18, 32767 * i.value), this.gameManager.simulateInput(t, 19, 0))
                                                      : (this.gameManager.simulateInput(t, 19, -32767 * i.value), this.gameManager.simulateInput(t, 18, 0))
                                                  : "RIGHT_STICK_X" === i.axis
                                                  ? 0 < i.value
                                                      ? (this.gameManager.simulateInput(t, 20, 32767 * i.value), this.gameManager.simulateInput(t, 21, 0))
                                                      : (this.gameManager.simulateInput(t, 21, -32767 * i.value), this.gameManager.simulateInput(t, 20, 0))
                                                  : "RIGHT_STICK_Y" === i.axis &&
                                                    (0 < i.value
                                                        ? (this.gameManager.simulateInput(t, 22, 32767 * i.value), this.gameManager.simulateInput(t, 23, 0))
                                                        : (this.gameManager.simulateInput(t, 23, -32767 * i.value), this.gameManager.simulateInput(t, 22, 0)))
                                              : (0 != n && s !== i.label && s !== i.axis + ":" + n) || this.gameManager.simulateInput(t, e, 0 == n ? 0 : 1))
                                        : this.gameManager.simulateInput(t, e, "buttonup" === i.type ? 0 : o.includes(e) ? 32767 : 1));
                }
            }
        }
        setVirtualGamepad() {
            (this.virtualGamepad = this.createElement("div")),
                (this.toggleVirtualGamepad = (e) => {
                    this.virtualGamepad.style.display = e ? "" : "none";
                }),
                this.virtualGamepad.classList.add("ejs_virtualGamepad_parent"),
                this.elements.parent.appendChild(this.virtualGamepad);
            var e = [
                { type: "button", text: "Fast", id: "speed_fast", location: "center", left: -35, top: 50, fontSize: 15, block: !0, input_value: 27 },
                { type: "button", text: "Slow", id: "speed_slow", location: "center", left: 95, top: 50, fontSize: 15, block: !0, input_value: 29 },
            ];
            this.rewindEnabled && e.push({ type: "button", text: "Rewind", id: "speed_rewind", location: "center", left: 30, top: 50, fontSize: 15, block: !0, input_value: 28 });
            let n;
            this.config.VirtualGamepadSettings &&
            ((t) => {
                if (Array.isArray(t)) {
                    if (t.length) {
                        for (let e = 0; e < t.length; e++)
                            if (t[e].type)
                                try {
                                    if ("zone" === t[e].type || "dpad" === t[e].type) {
                                        if (!t[e].location) return void console.warn("Missing location value for " + t[e].type + "! Using default gamepad settings");
                                        if (t[e].inputValues) continue;
                                        return void console.warn("Missing inputValues for " + t[e].type + "! Using default gamepad settings");
                                    }
                                    if (!t[e].location) return void console.warn("Missing location value for button " + t[e].text + "! Using default gamepad settings");
                                    if (!t[e].type) return void console.warn("Missing type value for button " + t[e].text + "! Using default gamepad settings");
                                    if (!t[e].id.toString()) return void console.warn("Missing id value for button " + t[e].text + "! Using default gamepad settings");
                                    if (!t[e].input_value.toString()) return void console.warn("Missing input_value for button " + t[e].text + "! Using default gamepad settings");
                                } catch (e) {
                                    return void console.warn("Error checking values! Using default gamepad settings");
                                }
                        return 1;
                    }
                    console.warn("Virtual gamepad settings is empty! Using default gamepad settings");
                } else console.warn("Virtual gamepad settings is not array! Using default gamepad settings");
            })(this.config.VirtualGamepadSettings)
                ? (n = this.config.VirtualGamepadSettings)
                : (n =
                      "gba" === this.getControlScheme()
                          ? [
                                { type: "button", text: "B", id: "b", location: "right", left: 10, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "A", id: "a", location: "right", left: 81, top: 40, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", top: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                                { type: "button", text: "L", id: "l", location: "left", left: 3, top: -90, bold: !0, block: !0, input_value: 10 },
                                { type: "button", text: "R", id: "r", location: "right", right: 3, top: -90, bold: !0, block: !0, input_value: 11 },
                            ]
                          : "gb" === this.getControlScheme()
                          ? [
                                { type: "button", text: "A", id: "a", location: "right", left: 81, top: 40, bold: !0, input_value: 8 },
                                { type: "button", text: "B", id: "b", location: "right", left: 10, top: 70, bold: !0, input_value: 0 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", top: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "nes" === this.getControlScheme()
                          ? [
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "A", id: "a", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "n64" === this.getControlScheme()
                          ? [
                                { type: "button", text: "B", id: "b", location: "right", left: -10, top: 95, input_value: 1, bold: !0 },
                                { type: "button", text: "A", id: "a", location: "right", left: 40, top: 150, input_value: 0, bold: !0 },
                                { type: "zone", id: "stick", location: "left", left: "50%", top: "100%", joystickInput: !0, inputValues: [16, 17, 18, 19] },
                                { type: "zone", id: "dpad", location: "left", left: "50%", top: "0%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 30, top: -10, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "L", id: "l", block: !0, location: "top", left: 10, top: -40, bold: !0, input_value: 10 },
                                { type: "button", text: "R", id: "r", block: !0, location: "top", right: 10, top: -40, bold: !0, input_value: 11 },
                                { type: "button", text: "Z", id: "z", block: !0, location: "top", left: 10, bold: !0, input_value: 12 },
                                { fontSize: 20, type: "button", text: "CU", id: "cu", location: "right", left: 25, top: -65, input_value: 23 },
                                { fontSize: 20, type: "button", text: "CD", id: "cd", location: "right", left: 25, top: 15, input_value: 22 },
                                { fontSize: 20, type: "button", text: "CL", id: "cl", location: "right", left: -15, top: -25, input_value: 21 },
                                { fontSize: 20, type: "button", text: "CR", id: "cr", location: "right", left: 65, top: -25, input_value: 20 },
                            ]
                          : "nds" === this.getControlScheme() || "snes" === this.getControlScheme()
                          ? [
                                { type: "button", text: "X", id: "x", location: "right", left: 40, bold: !0, input_value: 9 },
                                { type: "button", text: "Y", id: "y", location: "right", top: 40, bold: !0, input_value: 1 },
                                { type: "button", text: "A", id: "a", location: "right", left: 81, top: 40, bold: !0, input_value: 8 },
                                { type: "button", text: "B", id: "b", location: "right", left: 40, top: 80, bold: !0, input_value: 0 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", top: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                                { type: "button", text: "L", id: "l", location: "left", left: 3, top: -100, bold: !0, block: !0, input_value: 10 },
                                { type: "button", text: "R", id: "r", location: "right", right: 3, top: -100, bold: !0, block: !0, input_value: 11 },
                            ]
                          : ["segaMD", "segaCD", "sega32x"].includes(this.getControlScheme())
                          ? [
                                { type: "button", text: "A", id: "a", location: "right", right: 145, top: 70, bold: !0, input_value: 1 },
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "C", id: "c", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "button", text: "X", id: "x", location: "right", right: 145, top: 0, bold: !0, input_value: 10 },
                                { type: "button", text: "Y", id: "y", location: "right", right: 75, top: 0, bold: !0, input_value: 9 },
                                { type: "button", text: "Z", id: "z", location: "right", right: 5, top: 0, bold: !0, input_value: 11 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Mode", id: "mode", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : "segaMS" === this.getControlScheme()
                          ? [
                                { type: "button", text: "1", id: "button_1", location: "right", left: 10, top: 40, bold: !0, input_value: 0 },
                                { type: "button", text: "2", id: "button_2", location: "right", left: 81, top: 40, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                            ]
                          : "segaGG" === this.getControlScheme()
                          ? [
                                { type: "button", text: "1", id: "button_1", location: "right", left: 10, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "2", id: "button_2", location: "right", left: 81, top: 40, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", top: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 30, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : "segaSaturn" === this.getControlScheme()
                          ? [
                                { type: "button", text: "A", id: "a", location: "right", right: 145, top: 70, bold: !0, input_value: 1 },
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "C", id: "c", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "button", text: "X", id: "x", location: "right", right: 145, top: 0, bold: !0, input_value: 9 },
                                { type: "button", text: "Y", id: "y", location: "right", right: 75, top: 0, bold: !0, input_value: 10 },
                                { type: "button", text: "Z", id: "z", location: "right", right: 5, top: 0, bold: !0, input_value: 11 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "L", id: "l", location: "left", left: 3, top: -90, bold: !0, block: !0, input_value: 12 },
                                { type: "button", text: "R", id: "r", location: "right", right: 3, top: -90, bold: !0, block: !0, input_value: 13 },
                                { type: "button", text: "Start", id: "start", location: "center", left: 30, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : "atari2600" === this.getControlScheme()
                          ? [
                                { type: "button", text: "", id: "button_1", location: "right", right: 10, top: 70, bold: !0, input_value: 0 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Reset", id: "reset", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "atari7800" === this.getControlScheme()
                          ? [
                                { type: "button", text: "1", id: "button_1", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "2", id: "button_2", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Reset", id: "reset", location: "center", left: -35, fontSize: 15, block: !0, input_value: 9 },
                                { type: "button", text: "Pause", id: "pause", location: "center", left: 95, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: 30, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "lynx" === this.getControlScheme()
                          ? [
                                { type: "button", text: "B", id: "button_1", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "A", id: "button_2", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Opt 1", id: "option_1", location: "center", left: -35, fontSize: 15, block: !0, input_value: 10 },
                                { type: "button", text: "Opt 2", id: "option_2", location: "center", left: 95, fontSize: 15, block: !0, input_value: 11 },
                                { type: "button", text: "Start", id: "start", location: "center", left: 30, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : "jaguar" === this.getControlScheme()
                          ? [
                                { type: "button", text: "A", id: "a", location: "right", right: 145, top: 70, bold: !0, input_value: 8 },
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "C", id: "c", location: "right", right: 5, top: 70, bold: !0, input_value: 1 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Option", id: "option", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Pause", id: "pause", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "vb" === this.getControlScheme()
                          ? [
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 150, bold: !0, input_value: 0 },
                                { type: "button", text: "A", id: "a", location: "right", right: 5, top: 150, bold: !0, input_value: 8 },
                                { type: "dpad", id: "left_dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "dpad", id: "right_dpad", location: "right", left: "50%", right: "50%", joystickInput: !1, inputValues: [19, 18, 17, 16] },
                                { type: "button", text: "L", id: "l", location: "left", left: 3, top: -90, bold: !0, block: !0, input_value: 10 },
                                { type: "button", text: "R", id: "r", location: "right", right: 3, top: -90, bold: !0, block: !0, input_value: 11 },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "3do" === this.getControlScheme()
                          ? [
                                { type: "button", text: "A", id: "a", location: "right", right: 145, top: 70, bold: !0, input_value: 1 },
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "C", id: "c", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "L", id: "l", location: "left", left: 3, top: -90, bold: !0, block: !0, input_value: 10 },
                                { type: "button", text: "R", id: "r", location: "right", right: 3, top: -90, bold: !0, block: !0, input_value: 11 },
                                { type: "button", text: "X", id: "x", location: "center", left: -5, fontSize: 15, block: !0, bold: !0, input_value: 2 },
                                { type: "button", text: "P", id: "p", location: "center", left: 60, fontSize: 15, block: !0, bold: !0, input_value: 3 },
                            ]
                          : "pce" === this.getControlScheme()
                          ? [
                                { type: "button", text: "II", id: "ii", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "I", id: "i", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Run", id: "run", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]
                          : "ngp" === this.getControlScheme()
                          ? [
                                { type: "button", text: "A", id: "a", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "B", id: "b", location: "right", right: 5, top: 50, bold: !0, input_value: 8 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Option", id: "option", location: "center", left: 30, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : "ws" === this.getControlScheme()
                          ? [
                                { type: "button", text: "B", id: "b", location: "right", right: 75, top: 150, bold: !0, input_value: 0 },
                                { type: "button", text: "A", id: "a", location: "right", right: 5, top: 150, bold: !0, input_value: 8 },
                                { type: "dpad", id: "x_dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "dpad", id: "y_dpad", location: "right", left: "50%", right: "50%", joystickInput: !1, inputValues: [13, 12, 10, 11] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 30, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : "coleco" === this.getControlScheme()
                          ? [
                                { type: "button", text: "L", id: "l", location: "right", left: 10, top: 40, bold: !0, input_value: 8 },
                                { type: "button", text: "R", id: "r", location: "right", left: 81, top: 40, bold: !0, input_value: 0 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                            ]
                          : "pcfx" === this.getControlScheme()
                          ? [
                                { type: "button", text: "I", id: "i", location: "right", right: 5, top: 70, bold: !0, input_value: 8 },
                                { type: "button", text: "II", id: "ii", location: "right", right: 75, top: 70, bold: !0, input_value: 0 },
                                { type: "button", text: "III", id: "iii", location: "right", right: 145, top: 70, bold: !0, input_value: 9 },
                                { type: "button", text: "IV", id: "iv", location: "right", right: 5, top: 0, bold: !0, input_value: 1 },
                                { type: "button", text: "V", id: "v", location: "right", right: 75, top: 0, bold: !0, input_value: 10 },
                                { type: "button", text: "VI", id: "vi", location: "right", right: 145, top: 0, bold: !0, input_value: 11 },
                                { type: "dpad", id: "dpad", location: "left", left: "50%", right: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                                { type: "button", text: "Run", id: "run", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                            ]
                          : [
                                { type: "button", text: "Y", id: "y", location: "right", left: 40, bold: !0, input_value: 9 },
                                { type: "button", text: "X", id: "x", location: "right", top: 40, bold: !0, input_value: 1 },
                                { type: "button", text: "B", id: "b", location: "right", left: 81, top: 40, bold: !0, input_value: 8 },
                                { type: "button", text: "A", id: "a", location: "right", left: 40, top: 80, bold: !0, input_value: 0 },
                                { type: "zone", id: "dpad", location: "left", left: "50%", top: "50%", joystickInput: !1, inputValues: [4, 5, 6, 7] },
                                { type: "button", text: "Start", id: "start", location: "center", left: 60, fontSize: 15, block: !0, input_value: 3 },
                                { type: "button", text: "Select", id: "select", location: "center", left: -5, fontSize: 15, block: !0, input_value: 2 },
                            ]).push(...e);
            for (let e = 0; e < n.length; e++) n[e].text && (n[e].text = this.localization(n[e].text));
            n = JSON.parse(JSON.stringify(n));
            var e = this.createElement("div"),
                t = (e.classList.add("ejs_virtualGamepad_top"), this.createElement("div"));
            t.classList.add("ejs_virtualGamepad_bottom");
            let i = this.createElement("div"),
                s = (i.classList.add("ejs_virtualGamepad_left"), this.createElement("div")),
                o = (s.classList.add("ejs_virtualGamepad_right"), { top: e, center: t, left: i, right: s });
            this.virtualGamepad.appendChild(e),
                this.virtualGamepad.appendChild(t),
                this.virtualGamepad.appendChild(i),
                this.virtualGamepad.appendChild(s),
                (this.toggleVirtualGamepadLeftHanded = (e) => {
                    i.classList.toggle("ejs_virtualGamepad_left", !e), s.classList.toggle("ejs_virtualGamepad_right", !e), i.classList.toggle("ejs_virtualGamepad_right", e), s.classList.toggle("ejs_virtualGamepad_left", e);
                });
            let l = ("cs_" + this.getControlScheme()).split(/\s/g).join("_");
            for (let i = 0; i < n.length; i++)
                if ("button" === n[i].type) {
                    let e = "";
                    if (
                        (n[i].left && (e += "left:" + n[i].left + ("number" == typeof n[i].left ? "px" : "") + ";"),
                        n[i].right && (e += "right:" + n[i].right + ("number" == typeof n[i].right ? "px" : "") + ";"),
                        n[i].top && (e += "top:" + n[i].top + ("number" == typeof n[i].top ? "px" : "") + ";"),
                        n[i].bold ? (n[i].bold, (e += "font-weight:bold;")) : (e += "font-weight:normal;"),
                        (n[i].fontSize = n[i].fontSize || 30),
                        (e += "font-size:" + n[i].fontSize + "px;"),
                        n[i].block && (e += "height:31px;text-align:center;border:1px solid #ccc;border-radius:5px;line-height:31px;"),
                        ["top", "center", "left", "right"].includes(n[i].location))
                    ) {
                        var a = this.createElement("div");
                        (a.style = e), (a.innerText = n[i].text), a.classList.add("ejs_virtualGamepad_button", l), n[i].id && a.classList.add("b_" + n[i].id), o[n[i].location].appendChild(a);
                        let t = n[i].input_new_cores || n[i].input_value;
                        this.addEventListener(a, "touchstart touchend touchcancel", (e) => {
                            e.preventDefault(),
                                "touchend" === e.type || "touchcancel" === e.type
                                    ? (e.target.classList.remove("ejs_virtualGamepad_button_down"),
                                      window.setTimeout(() => {
                                          this.gameManager.simulateInput(0, t, 0);
                                      }))
                                    : (e.target.classList.add("ejs_virtualGamepad_button_down"), this.gameManager.simulateInput(0, t, 1));
                        });
                    }
                }
            let r = (e) => {
                var t = e.container;
                let r = e.event,
                    c = this.createElement("div");
                c.classList.add("ejs_dpad_main");
                var e = this.createElement("div"),
                    i = (e.classList.add("ejs_dpad_vertical"), this.createElement("div")),
                    n = (i.classList.add("ejs_dpad_horizontal"), this.createElement("div")),
                    s = (n.classList.add("ejs_dpad_bar"), this.createElement("div"));
                s.classList.add("ejs_dpad_bar"), i.appendChild(n), e.appendChild(s), c.appendChild(e), c.appendChild(i);
                this.addEventListener(c, "touchstart touchmove", (o) => {
                    o.preventDefault();
                    o = o.targetTouches[0];
                    if (o) {
                        var l = c.getBoundingClientRect(),
                            a = o.clientX - l.left - c.clientWidth / 2,
                            o = o.clientY - l.top - c.clientHeight / 2;
                        let e = 0,
                            t = 0,
                            i = 0,
                            n = 0,
                            s = Math.atan(a / o) / (Math.PI / 180);
                        o <= -10 && (e = 1),
                            10 <= o && (t = 1),
                            10 <= a && ((n = 1), ((s < (i = 0) && -35 <= s) || (0 < s && s <= 35)) && (n = 0), (e = s < 0 && -55 <= s ? 1 : 0), (t = 0 < s && s <= 55 ? 1 : 0)),
                            a <= -10 && ((n = 0), (i = (s < 0 && -35 <= s) || (0 < s && s <= 35) ? 0 : 1), (e = 0 < s && s <= 55 ? 1 : 0), (t = s < 0 && -55 <= s ? 1 : 0)),
                            c.classList.toggle("ejs_dpad_up_pressed", e),
                            c.classList.toggle("ejs_dpad_down_pressed", t),
                            c.classList.toggle("ejs_dpad_right_pressed", n),
                            c.classList.toggle("ejs_dpad_left_pressed", i),
                            r(e, t, i, n);
                    }
                }),
                    this.addEventListener(c, "touchend touchcancel", (e) => {
                        e.preventDefault(), c.classList.remove("ejs_dpad_up_pressed"), c.classList.remove("ejs_dpad_down_pressed"), c.classList.remove("ejs_dpad_right_pressed"), c.classList.remove("ejs_dpad_left_pressed"), r(0, 0, 0, 0);
                    }),
                    t.appendChild(c);
            };
            if (
                (n.forEach((s, e) => {
                    if ("dpad" === s.type) {
                        var t = this.createElement("div");
                        let e = "";
                        s.left && (e += "left:" + s.left + ";"),
                            s.right && (e += "right:" + s.right + ";"),
                            s.top && (e += "top:" + s.top + ";"),
                            t.classList.add(l),
                            s.id && t.classList.add("b_" + s.id),
                            (t.style = e),
                            o[s.location].appendChild(t),
                            r({
                                container: t,
                                event: (e, t, i, n) => {
                                    s.joystickInput && (1 === e && (e = 32767), 1 === t && (t = 32767), 1 === i && (i = 32767), 1 === n) && (n = 32767),
                                        this.gameManager.simulateInput(0, s.inputValues[0], e),
                                        this.gameManager.simulateInput(0, s.inputValues[1], t),
                                        this.gameManager.simulateInput(0, s.inputValues[2], i),
                                        this.gameManager.simulateInput(0, s.inputValues[3], n);
                                },
                            });
                    }
                }),
                n.forEach((s, e) => {
                    var t;
                    "zone" === s.type &&
                        ((t = this.createElement("div")),
                        this.addEventListener(t, "touchstart touchmove touchend touchcancel", (e) => {
                            e.preventDefault();
                        }),
                        t.classList.add(l),
                        s.id && t.classList.add("b_" + s.id),
                        o[s.location].appendChild(t),
                        (t = nipplejs.create({ zone: t, mode: "static", position: { left: s.left, top: s.top }, color: s.color || "red" })).on("end", () => {
                            this.gameManager.simulateInput(0, s.inputValues[0], 0),
                                this.gameManager.simulateInput(0, s.inputValues[1], 0),
                                this.gameManager.simulateInput(0, s.inputValues[2], 0),
                                this.gameManager.simulateInput(0, s.inputValues[3], 0);
                        }),
                        t.on("move", (e, i) => {
                            var n = i.angle.degree,
                                i = i.distance;
                            if (!0 === s.joystickInput) {
                                let e = 0,
                                    t = 0;
                                0 < n && n <= 45 && ((e = i / 50), (t = (-0.022222222222222223 * n * i) / 50)),
                                    45 < n && n <= 90 && ((e = (0.022222222222222223 * (90 - n) * i) / 50), (t = -i / 50)),
                                    90 < n && n <= 135 && ((e = (0.022222222222222223 * (90 - n) * i) / 50), (t = -i / 50)),
                                    135 < n && n <= 180 && ((e = -i / 50), (t = (-0.022222222222222223 * (180 - n) * i) / 50)),
                                    135 < n && n <= 225 && ((e = -i / 50), (t = (-0.022222222222222223 * (180 - n) * i) / 50)),
                                    225 < n && n <= 270 && ((e = (-0.022222222222222223 * (270 - n) * i) / 50), (t = i / 50)),
                                    270 < n && n <= 315 && ((e = (-0.022222222222222223 * (270 - n) * i) / 50), (t = i / 50)),
                                    315 < n && n <= 359.9 && ((e = i / 50), (t = (0.022222222222222223 * (360 - n) * i) / 50)),
                                    0 < e
                                        ? (this.gameManager.simulateInput(0, s.inputValues[0], 32767 * e), this.gameManager.simulateInput(0, s.inputValues[1], 0))
                                        : (this.gameManager.simulateInput(0, s.inputValues[1], 32767 * -e), this.gameManager.simulateInput(0, s.inputValues[0], 0)),
                                    0 < t
                                        ? (this.gameManager.simulateInput(0, s.inputValues[2], 32767 * t), this.gameManager.simulateInput(0, s.inputValues[3], 0))
                                        : (this.gameManager.simulateInput(0, s.inputValues[3], 32767 * -t), this.gameManager.simulateInput(0, s.inputValues[2], 0));
                            } else
                                30 <= n && n < 150
                                    ? this.gameManager.simulateInput(0, s.inputValues[0], 1)
                                    : window.setTimeout(() => {
                                          this.gameManager.simulateInput(0, s.inputValues[0], 0);
                                      }, 30),
                                    210 <= n && n < 330
                                        ? this.gameManager.simulateInput(0, s.inputValues[1], 1)
                                        : window.setTimeout(() => {
                                              this.gameManager.simulateInput(0, s.inputValues[1], 0);
                                          }, 30),
                                    120 <= n && n < 240
                                        ? this.gameManager.simulateInput(0, s.inputValues[2], 1)
                                        : window.setTimeout(() => {
                                              this.gameManager.simulateInput(0, s.inputValues[2], 0);
                                          }, 30),
                                    300 <= n || (0 <= n && n < 60)
                                        ? this.gameManager.simulateInput(0, s.inputValues[3], 1)
                                        : window.setTimeout(() => {
                                              this.gameManager.simulateInput(0, s.inputValues[3], 0);
                                          }, 30);
                        }));
                }),
                this.touch || 0 < navigator.maxTouchPoints)
            ) {
                let e = this.createElement("div");
                (e.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"/></svg>'),
                    e.classList.add("ejs_virtualGamepad_open"),
                    (e.style.display = "none"),
                    this.on("start", () => (e.style.display = "")),
                    this.elements.parent.appendChild(e);
                let t,
                    i = !0;
                this.addEventListener(e, "touchstart touchend mousedown mouseup click", (e) => {
                    i &&
                        (clearTimeout(t),
                        (t = setTimeout(() => {
                            i = !0;
                        }, 2e3)),
                        (i = !1),
                        e.preventDefault(),
                        this.menu.toggle());
                }),
                    (this.elements.menuToggle = e);
            }
            this.virtualGamepad.style.display = "none";
        }
        handleResize() {
            this.virtualGamepad &&
                "none" === this.virtualGamepad.style.display &&
                ((this.virtualGamepad.style.opacity = 0),
                (this.virtualGamepad.style.display = ""),
                setTimeout(() => {
                    (this.virtualGamepad.style.display = "none"), (this.virtualGamepad.style.opacity = "");
                }, 250));
            var e,
                t,
                i = this.elements.parent.getBoundingClientRect();
            this.game.parentElement.classList.toggle("ejs_small_screen", i.width <= 575),
                this.game.parentElement.classList.toggle("ejs_big_screen", 575 < i.width),
                this.Module && ((e = window.devicePixelRatio || 1), (t = i.width * e), (i = i.height * e), this.Module.setCanvasSize(t, i), this.handleSettingsResize) && this.handleSettingsResize();
        }
        getElementSize(e) {
            var t = e.cloneNode(!0),
                e = ((t.style.position = "absolute"), (t.style.opacity = 0), t.removeAttribute("hidden"), e.parentNode.appendChild(t), t.getBoundingClientRect());
            return t.remove(), { width: e.width, height: e.height };
        }
        saveSettings() {
            var e, t;
            window.localStorage &&
                !this.config.disableLocalStorage &&
                this.settingsLoaded &&
                (this.started || this.failedToStart) &&
                ((e = { controlSettings: this.controls, settings: this.settings, cheats: this.cheats }),
                (t = { volume: this.volume, muted: this.muted }),
                localStorage.setItem("ejs-settings", JSON.stringify(t)),
                localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(e)));
        }
        getLocalStorageKey() {
            let e = (this.config.gameId || 1) + "-" + this.getCore(!0);
            return (
                "string" != typeof this.config.gameUrl || this.config.gameUrl.toLowerCase().startsWith("blob:")
                    ? this.config.gameUrl instanceof File
                        ? (e += "-" + this.config.gameUrl.name)
                        : "number" != typeof this.config.gameId && console.warn("gameId (EJS_gameID) is not set. This may result in settings persisting across games.")
                    : (e += "-" + this.config.gameUrl),
                "ejs-" + e + "-settings"
            );
        }
        preGetSetting(e) {
            if (window.localStorage && !this.config.disableLocalStorage) {
                var t = localStorage.getItem(this.getLocalStorageKey());
                try {
                    if ((t = JSON.parse(t)) && t.settings) return t.settings[e];
                } catch (e) {
                    console.warn("Could not load previous settings", e);
                }
            }
            return this.config.defaultOptions && this.config.defaultOptions[e] ? this.config.defaultOptions[e] : null;
        }
        loadSettings() {
            if (window.localStorage && !this.config.disableLocalStorage) {
                this.settingsLoaded = !0;
                var e = localStorage.getItem("ejs-settings"),
                    i = localStorage.getItem(this.getLocalStorageKey());
                if (i)
                    try {
                        if (!((i = JSON.parse(i)).controlSettings instanceof Object && i.settings instanceof Object && Array.isArray(i.cheats))) return;
                        for (var t in ((this.controls = i.controlSettings), this.checkGamepadInputs(), i.settings)) this.changeSettingOption(t, i.settings[t]);
                        for (let e = 0; e < i.cheats.length; e++) {
                            var n = i.cheats[e];
                            let t = !1;
                            for (let e = 0; e < this.cheats.length; e++)
                                if (this.cheats[e].desc === n.desc && this.cheats[e].code === n.code) {
                                    (this.cheats[e].checked = n.checked), (t = !0);
                                    break;
                                }
                            t || this.cheats.push(n);
                        }
                    } catch (e) {
                        console.warn("Could not load previous settings", e);
                    }
                if (e)
                    try {
                        "number" == typeof (e = JSON.parse(e)).volume && "boolean" == typeof e.muted && ((this.volume = e.volume), (this.muted = e.muted), this.setVolume(this.muted ? 0 : this.volume));
                    } catch (e) {
                        console.warn("Could not load previous settings", e);
                    }
            }
        }
        handleSpecialOptions(e, t) {
            "shader" === e
                ? this.enableShader(t)
                : "disk" === e
                ? this.gameManager.setCurrentDisk(t)
                : "virtual-gamepad" === e
                ? this.toggleVirtualGamepad("disabled" !== t)
                : "virtual-gamepad-left-handed-mode" === e
                ? this.toggleVirtualGamepadLeftHanded("disabled" !== t)
                : "ff-ratio" === e
                ? (this.isFastForward && this.gameManager.toggleFastForward(0),
                  "unlimited" === t ? this.gameManager.setFastForwardRatio(0) : isNaN(t) || this.gameManager.setFastForwardRatio(parseFloat(t)),
                  setTimeout(() => {
                      this.isFastForward && this.gameManager.toggleFastForward(1);
                  }, 10))
                : "fastForward" === e
                ? "enabled" === t
                    ? ((this.isFastForward = !0), this.gameManager.toggleFastForward(1))
                    : "disabled" === t && ((this.isFastForward = !1), this.gameManager.toggleFastForward(0))
                : "sm-ratio" === e
                ? (this.isSlowMotion && this.gameManager.toggleSlowMotion(0),
                  this.gameManager.setSlowMotionRatio(parseFloat(t)),
                  setTimeout(() => {
                      this.isSlowMotion && this.gameManager.toggleSlowMotion(1);
                  }, 10))
                : "slowMotion" === e
                ? "enabled" === t
                    ? ((this.isSlowMotion = !0), this.gameManager.toggleSlowMotion(1))
                    : "disabled" === t && ((this.isSlowMotion = !1), this.gameManager.toggleSlowMotion(0))
                : "rewind-granularity" === e
                ? this.rewindEnabled && this.gameManager.setRewindGranularity(parseInt(t))
                : "vsync" === e
                ? this.gameManager.setVSync("enabled" === t)
                : "videoRotation" === e &&
                  ((t = parseInt(t)),
                  !0 === this.videoRotationChanged || 0 !== t
                      ? (this.gameManager.setVideoRotation(t), (this.videoRotationChanged = !0))
                      : !0 === this.videoRotationChanged && 0 === t && (this.gameManager.setVideoRotation(0), (this.videoRotationChanged = !0)));
        }
        menuOptionChanged(e, t) {
            this.saveSettings(), this.debug && console.log(e, t), this.gameManager && (this.handleSpecialOptions(e, t), this.gameManager.setVariable(e, t), this.saveSettings());
        }
        setupDisksMenu() {
            (this.disksMenu = this.createElement("div")), this.disksMenu.classList.add("ejs_settings_parent");
            let p = this.createElement("div"),
                u = (p.classList.add("ejs_settings_transition"), (this.disks = {}), this.createElement("div")),
                m = ((u.style.overflow = "auto"), []),
                I =
                    ((this.handleDisksResize = () => {
                        let e = !1,
                            t = ("" !== this.disksMenu.style.display && ((this.disksMenu.style.opacity = "0"), (this.disksMenu.style.display = ""), (e = !0)), this.elements.parent.getBoundingClientRect().height);
                        var i = this.diskParent.parentElement.getBoundingClientRect().width;
                        let n = this.diskParent.getBoundingClientRect().x;
                        i > window.innerWidth && (n += i - window.innerWidth);
                        i = n > (i - 15) / 2;
                        375 < t && (t = 375), (u.style["max-height"] = t - 95 + "px"), (p.style["max-height"] = t - 95 + "px");
                        for (let e = 0; e < m.length; e++) m[e].style["max-height"] = t - 95 + "px";
                        this.disksMenu.classList.toggle("ejs_settings_center_left", !i), this.disksMenu.classList.toggle("ejs_settings_center_right", i), e && ((this.disksMenu.style.display = "none"), (this.disksMenu.style.opacity = ""));
                    }),
                    u.classList.add("ejs_setting_menu"),
                    p.appendChild(u),
                    []),
                C =
                    ((this.changeDiskOption = (t, e) => {
                        (this.disks[t] = e), I.forEach((e) => e(t));
                    }),
                    {});
            var t = (e, n, t, s) => {
                var i = this.createElement("span");
                i.innerText = e;
                let o = this.createElement("div"),
                    l = ((o.innerText = ""), o.classList.add("ejs_settings_main_bar_selected"), i.appendChild(o), this.createElement("div"));
                m.push(l), (l.style.overflow = "auto"), l.setAttribute("hidden", "");
                i = this.createElement("button");
                let a = () => {
                    var e = this.getElementSize(u);
                    (p.style.width = e.width + 20 + "px"), (p.style.height = e.height + "px"), l.setAttribute("hidden", ""), u.removeAttribute("hidden");
                };
                this.addEventListener(i, "click", a), (i.type = "button"), i.classList.add("ejs_back_button"), l.appendChild(i);
                var r = this.createElement("span"),
                    c = ((r.innerText = e), r.classList.add("ejs_menu_text_a"), i.appendChild(r), this.createElement("div"));
                c.classList.add("ejs_setting_menu");
                let d = [],
                    g = t;
                if (Array.isArray(t)) {
                    g = {};
                    for (let e = 0; e < t.length; e++) g[t[e]] = t[e];
                }
                (C[n] = g),
                    I.push((e) => {
                        if (n === e) {
                            for (let e = 0; e < d.length; e++) d[e].classList.toggle("ejs_option_row_selected", d[e].getAttribute("ejs_value") === this.disks[n]);
                            this.menuOptionChanged(n, this.disks[n]), (o.innerText = g[this.disks[n]]);
                        }
                    });
                for (let i in g) {
                    let t = this.createElement("button");
                    d.push(t),
                        t.setAttribute("ejs_value", i),
                        (t.type = "button"),
                        (t.value = g[i]),
                        t.classList.add("ejs_option_row"),
                        t.classList.add("ejs_button_style"),
                        this.addEventListener(t, "click", (e) => {
                            this.disks[n] = i;
                            for (let e = 0; e < d.length; e++) d[e].classList.remove("ejs_option_row_selected");
                            t.classList.add("ejs_option_row_selected"), this.menuOptionChanged(n, i), (o.innerText = g[i]), a();
                        }),
                        s === i && (t.classList.add("ejs_option_row_selected"), this.menuOptionChanged(n, i), (o.innerText = g[i]));
                    var h = this.createElement("span");
                    (h.innerText = g[i]), t.appendChild(h), c.appendChild(t);
                }
                u.appendChild(c), p.appendChild(l);
            };
            if (1 < this.gameManager.getDiskCount()) {
                var n = {};
                let e = !1,
                    i = {};
                "m3u" === this.fileName.split(".").pop() && ((i = this.gameManager.Module.FS.readFile(this.fileName, { encoding: "utf8" }).split("\n")), (e = !0));
                for (let t = 0; t < this.gameManager.getDiskCount(); t++)
                    if (e) {
                        var s = i[t].split("|");
                        let e = s[0].replace("." + s[0].split(".").pop(), "");
                        2 <= s.length && (e = s[1]), (n[t.toString()] = e);
                    } else n[t.toString()] = "Disk " + (t + 1);
                t(this.localization("Disk"), "disk", n, this.gameManager.getCurrentDisk().toString());
            }
            this.disksMenu.appendChild(p), this.diskParent.appendChild(this.disksMenu), (this.diskParent.style.position = "relative");
            t = this.getElementSize(u);
            if (((p.style.width = t.width + 20 + "px"), (p.style.height = t.height + "px"), (this.disksMenu.style.display = "none"), this.debug && console.log("Available core options", C), this.config.defaultOptions))
                for (var e in this.config.defaultOptions) this.changeDiskOption(e, this.config.defaultOptions[e]);
        }
        setupSettingsMenu() {
            (this.settingsMenu = this.createElement("div")), this.settingsMenu.classList.add("ejs_settings_parent");
            let m = this.createElement("div"),
                I = (m.classList.add("ejs_settings_transition"), (this.settings = {}), []);
            var e = (e, t, n) => {
                var s = this.createElement("div");
                if (((s.style.overflow = "auto"), s.classList.add("ejs_setting_menu"), e)) {
                    var e = this.createElement("div"),
                        o = (e.classList.add("ejs_settings_main_bar"), this.createElement("span"));
                    (o.innerText = t), e.appendChild(o), n.appendChild(e);
                    let i = this.createElement("div");
                    I.push(i), (i.style.overflow = "auto"), i.setAttribute("hidden", "");
                    (o = this.createElement("button")),
                        (e =
                            (this.addEventListener(e, "click", (e) => {
                                var t = this.getElementSize(i);
                                (m.style.width = t.width + 20 + "px"), (m.style.height = t.height + "px"), i.removeAttribute("hidden"), n.setAttribute("hidden", "");
                            }),
                            this.addEventListener(o, "click", () => {
                                var e = this.getElementSize(n);
                                (m.style.width = e.width + 20 + "px"), (m.style.height = e.height + "px"), i.setAttribute("hidden", ""), n.removeAttribute("hidden");
                            }),
                            (o.type = "button"),
                            o.classList.add("ejs_back_button"),
                            i.appendChild(o),
                            this.createElement("span")));
                    (e.innerText = t), e.classList.add("ejs_menu_text_a"), o.appendChild(e), i.appendChild(s), m.appendChild(i);
                }
                return s;
            };
            let C = e(),
                y =
                    ((this.handleSettingsResize = () => {
                        let e = !1,
                            t = ("" !== this.settingsMenu.style.display && ((this.settingsMenu.style.opacity = "0"), (this.settingsMenu.style.display = ""), (e = !0)), this.elements.parent.getBoundingClientRect().height);
                        var i = this.settingParent.parentElement.getBoundingClientRect().width;
                        let n = this.settingParent.getBoundingClientRect().x;
                        i > window.innerWidth && (n += i - window.innerWidth);
                        i = n > (i - 15) / 2;
                        375 < t && (t = 375), (C.style["max-height"] = t - 95 + "px"), (m.style["max-height"] = t - 95 + "px");
                        for (let e = 0; e < I.length; e++) I[e].style["max-height"] = t - 95 + "px";
                        this.settingsMenu.classList.toggle("ejs_settings_center_left", !i),
                            this.settingsMenu.classList.toggle("ejs_settings_center_right", i),
                            e && ((this.settingsMenu.style.display = "none"), (this.settingsMenu.style.opacity = ""));
                    }),
                    m.appendChild(C),
                    []),
                b = {},
                Z =
                    ((this.changeSettingOption = (t, e, i) => {
                        !0 !== i && (this.settings[t] = e), (b[t] = e), y.forEach((e) => e(t));
                    }),
                    {}),
                l = (e, n, t, s, i, o) => {
                    i = i || C;
                    let l = o ? i.parentElement : i;
                    var o = this.createElement("div"),
                        a = (o.classList.add("ejs_settings_main_bar"), this.createElement("span"));
                    a.innerText = e;
                    let r = this.createElement("div"),
                        c = ((r.innerText = ""), r.classList.add("ejs_settings_main_bar_selected"), a.appendChild(r), o.appendChild(a), i.appendChild(o), this.createElement("div"));
                    I.push(c), (c.style.overflow = "auto"), c.setAttribute("hidden", "");
                    a = this.createElement("button");
                    let d = () => {
                        var e = this.getElementSize(l);
                        (m.style.width = e.width + 20 + "px"), (m.style.height = e.height + "px"), c.setAttribute("hidden", ""), l.removeAttribute("hidden");
                    };
                    this.addEventListener(o, "click", (e) => {
                        var t = this.getElementSize(c);
                        (m.style.width = t.width + 20 + "px"), (m.style.height = t.height + "px"), c.removeAttribute("hidden"), l.setAttribute("hidden", "");
                    }),
                        this.addEventListener(a, "click", d),
                        (a.type = "button"),
                        a.classList.add("ejs_back_button"),
                        c.appendChild(a);
                    var i = this.createElement("span"),
                        g = ((i.innerText = e), i.classList.add("ejs_menu_text_a"), a.appendChild(i), this.createElement("div"));
                    g.classList.add("ejs_setting_menu");
                    let h = [],
                        p = t;
                    if (Array.isArray(t)) {
                        p = {};
                        for (let e = 0; e < t.length; e++) p[t[e]] = t[e];
                    }
                    (Z[n] = p),
                        y.push((e) => {
                            if (n === e) {
                                for (let e = 0; e < h.length; e++) h[e].classList.toggle("ejs_option_row_selected", h[e].getAttribute("ejs_value") === b[n]);
                                this.menuOptionChanged(n, b[n]), (r.innerText = p[b[n]]);
                            }
                        });
                    for (let i in p) {
                        let t = this.createElement("button");
                        h.push(t),
                            t.setAttribute("ejs_value", i),
                            (t.type = "button"),
                            (t.value = p[i]),
                            t.classList.add("ejs_option_row"),
                            t.classList.add("ejs_button_style"),
                            this.addEventListener(t, "click", (e) => {
                                this.changeSettingOption(n, i);
                                for (let e = 0; e < h.length; e++) h[e].classList.remove("ejs_option_row_selected");
                                t.classList.add("ejs_option_row_selected"), this.menuOptionChanged(n, i), (r.innerText = p[i]), d();
                            }),
                            s === i && (t.classList.add("ejs_option_row_selected"), this.menuOptionChanged(n, i), (r.innerText = p[i]));
                        var u = this.createElement("span");
                        (u.innerText = p[i]), t.appendChild(u), g.appendChild(t);
                    }
                    c.appendChild(g), m.appendChild(c);
                };
            var t = this.getCores()[this.getCore(!0)],
                t =
                    (t && 1 < t.length && l(this.localization("Core (" + this.localization("Requires restart") + ")"), "retroarch_core", t, this.getCore(), C),
                    "function" != typeof window.SharedArrayBuffer ||
                        this.requiresThreads(this.getCore()) ||
                        l(this.localization("Threads"), "ejs_threads", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, this.config.threads ? "enabled" : "disabled", C),
                    e(!0, "Graphics Settings", C));
            if (this.config.shaders) {
                var i,
                    n = {
                        "2xScaleHQ.glslp": this.localization("2xScaleHQ"),
                        "4xScaleHQ.glslp": this.localization("4xScaleHQ"),
                        "crt-aperture.glslp": this.localization("CRT aperture"),
                        "crt-beam": this.localization("CRT beam"),
                        "crt-caligari": this.localization("CRT caligari"),
                        "crt-easymode.glslp": this.localization("CRT easymode"),
                        "crt-geom.glslp": this.localization("CRT geom"),
                        "crt-lottes": this.localization("CRT lottes"),
                        "crt-mattias.glslp": this.localization("CRT mattias"),
                        "crt-yeetron": this.localization("CRT yeetron"),
                        "crt-zfast": this.localization("CRT zfast"),
                        sabr: this.localization("SABR"),
                        bicubic: this.localization("Bicubic"),
                        "mix-frames": this.localization("Mix frames"),
                    },
                    s = { disabled: this.localization("Disabled") };
                for (i in this.config.shaders) n[i] ? (s[i] = n[i]) : (s[i] = i);
                l(this.localization("Shaders"), "shader", s, "disabled", t, !0);
            }
            this.supportsWebgl2 &&
                !this.requiresWebGL2(this.getCore()) &&
                l(
                    this.localization("WebGL2") + " (" + this.localization("Requires restart") + ")",
                    "webgl2Enabled",
                    { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") },
                    this.webgl2Enabled ? "enabled" : "disabled",
                    t,
                    !0
                ),
                l(this.localization("FPS"), "fps", { show: this.localization("show"), hide: this.localization("hide") }, "hide", t, !0),
                l(this.localization("VSync"), "vsync", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, "enabled", t, !0),
                l(this.localization("Video Rotation"), "videoRotation", { 0: "0 deg", 1: "90 deg", 2: "180 deg", 3: "270 deg" }, this.videoRotation.toString(), t, !0);
            var t = e(!0, "Speed Options", C);
            l(this.localization("Fast Forward"), "fastForward", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, "disabled", t, !0),
                l(this.localization("Fast Forward Ratio"), "ff-ratio", ["1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0", "9.5", "10.0", "unlimited"], "3.0", t, !0),
                l(this.localization("Slow Motion"), "slowMotion", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, "disabled", t, !0),
                l(this.localization("Slow Motion Ratio"), "sm-ratio", ["1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0", "9.5", "10.0"], "3.0", t, !0),
                l(this.localization("Rewind Enabled (" + this.localization("Requires restart") + ")"), "rewindEnabled", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, "disabled", t, !0),
                this.rewindEnabled && l(this.localization("Rewind Granularity"), "rewind-granularity", ["1", "3", "6", "12", "25", "50", "100"], "6", t, !0),
                this.saveInBrowserSupported() &&
                    ((t = e(!0, "Save States", C)),
                    l(this.localization("Save State Slot"), "save-state-slot", ["1", "2", "3", "4", "5", "6", "7", "8", "9"], "1", t, !0),
                    l(this.localization("Save State Location"), "save-state-location", { download: this.localization("Download"), browser: this.localization("Keep in Browser") }, "download", t, !0)),
                (this.touch || 0 < navigator.maxTouchPoints) &&
                    ((t = e(!0, "Virtual Gamepad", C)),
                    l(this.localization("Virtual Gamepad"), "virtual-gamepad", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, this.isMobile ? "enabled" : "disabled", t, !0),
                    l(this.localization("Left Handed Mode"), "virtual-gamepad-left-handed-mode", { enabled: this.localization("Enabled"), disabled: this.localization("Disabled") }, "disabled", t, !0));
            let a;
            try {
                a = this.gameManager.getCoreOptions();
            } catch (e) {}
            if (a) {
                let o = e(!0, "Core Options", C);
                a.split("\n").forEach((e, t) => {
                    var e = e.split("; "),
                        i = e[0],
                        n = e[1].split("|"),
                        e = i
                            .split("|")[0]
                            .replace(/_/g, " ")
                            .replace(/.+\-(.+)/, "$1");
                    if ((n.slice(1, -1), 1 !== n.length)) {
                        var s = {};
                        for (let e = 0; e < n.length; e++) s[n[e]] = this.localization(n[e], this.config.settingsLanguage);
                        l(this.localization(e, this.config.settingsLanguage), i.split("|")[0], s, 1 < i.split("|").length ? i.split("|")[1] : n[0].replace("(Default) ", ""), o, !0);
                    }
                });
            }
            if (this.retroarchOpts && Array.isArray(this.retroarchOpts)) {
                let t = e(!0, "RetroArch Options (" + this.localization("Requires restart") + ")", C);
                this.retroarchOpts.forEach((e) => {
                    l(this.localization(e.title, this.config.settingsLanguage), e.name, e.options, e.default, t, !0);
                });
            }
            this.settingsMenu.appendChild(m), this.settingParent.appendChild(this.settingsMenu), (this.settingParent.style.position = "relative");
            t = this.getElementSize(C);
            if (((m.style.width = t.width + 20 + "px"), (m.style.height = t.height + "px"), (this.settingsMenu.style.display = "none"), this.debug && console.log("Available core options", Z), this.config.defaultOptions))
                for (var o in this.config.defaultOptions) this.changeSettingOption(o, this.config.defaultOptions[o], !0);
        }
        createSubPopup(e) {
            var t = this.createElement("div"),
                i = (t.classList.add("ejs_popup_container"), t.classList.add("ejs_popup_container_box"), this.createElement("div"));
            return (i.innerText = ""), e && t.setAttribute("hidden", ""), t.appendChild(i), [t, i];
        }
        createNetplayMenu() {
            var e = this.createPopup(
                "Netplay",
                {
                    "Create a Room": () => {
                        this.isNetplay ? this.netplay.leaveRoom() : this.netplay.showOpenRoomDialog();
                    },
                    Close: () => {
                        (this.netplayMenu.style.display = "none"), this.netplay.updateList.stop();
                    },
                },
                !0
            );
            this.netplayMenu = e.parentElement;
            let o = this.netplayMenu.getElementsByTagName("a")[0],
                l = this.createElement("div");
            var t = this.createElement("strong"),
                i = ((t.innerText = this.localization("Rooms")), this.createElement("table")),
                n = (i.classList.add("ejs_netplay_table"), (i.style.width = "100%"), i.setAttribute("cellspacing", "0"), this.createElement("thead"));
            let s = this.createElement("tr");
            var a = (e) => {
                var t = this.createElement("td");
                return (t.innerText = e), (t.style["text-align"] = "center"), s.appendChild(t), t;
            };
            n.appendChild(s), (a("Room Name").style["text-align"] = "left"), (a("Players").style.width = "80px"), (a("").style.width = "80px"), i.appendChild(n);
            let r = this.createElement("tbody"),
                c = (i.appendChild(r), l.appendChild(t), l.appendChild(i), this.createElement("div")),
                d = this.createElement("strong"),
                g = ((d.innerText = "{roomname}"), this.createElement("div"));
            g.innerText = "Password: ";
            (a = this.createElement("table")), a.classList.add("ejs_netplay_table"), (a.style.width = "100%"), a.setAttribute("cellspacing", "0"), (n = this.createElement("thead"));
            let h = this.createElement("tr");
            t = (e) => {
                var t = this.createElement("td");
                return (t.innerText = e), h.appendChild(t), t;
            };
            n.appendChild(h), (t("Player").style.width = "80px"), t("Name"), (t("").style.width = "80px"), a.appendChild(n);
            let p = this.createElement("tbody");
            a.appendChild(p),
                c.appendChild(d),
                c.appendChild(g),
                c.appendChild(a),
                (c.style.display = "none"),
                e.appendChild(l),
                e.appendChild(c),
                (this.openNetplayMenu = () => {
                    if (((this.netplayMenu.style.display = ""), !this.netplay || (this.netplay, !this.netplay.name))) {
                        (this.netplay = {}),
                            (this.netplay.table = r),
                            (this.netplay.playerTable = p),
                            (this.netplay.passwordElem = g),
                            (this.netplay.roomNameElem = d),
                            (this.netplay.createButton = o),
                            (this.netplay.tabs = [l, c]),
                            this.defineNetplayFunctions();
                        let t = this.createSubPopup();
                        this.netplayMenu.appendChild(t[0]), t[1].classList.add("ejs_cheat_parent");
                        var e = t[1],
                            n = this.createElement("div"),
                            s = this.createElement("h2"),
                            s = ((s.innerText = this.localization("Set Player Name")), s.classList.add("ejs_netplay_name_heading"), n.appendChild(s), e.appendChild(n), this.createElement("div")),
                            n = (s.classList.add("ejs_netplay_header"), this.createElement("strong"));
                        n.innerText = this.localization("Player Name");
                        let i = this.createElement("input");
                        (i.type = "text"), i.setAttribute("maxlength", 20), s.appendChild(n), s.appendChild(this.createElement("br")), s.appendChild(i), e.appendChild(s), e.appendChild(this.createElement("br"));
                        n = this.createElement("button");
                        n.classList.add("ejs_button_button"),
                            n.classList.add("ejs_popup_submit"),
                            (n.style["background-color"] = "rgba(var(--ejs-primary-color),1)"),
                            (n.innerText = this.localization("Submit")),
                            e.appendChild(n),
                            this.addEventListener(n, "click", (e) => {
                                i.value.trim() && ((this.netplay.name = i.value.trim()), t[0].remove());
                            });
                    }
                    this.netplay.updateList.start();
                });
        }
        defineNetplayFunctions() {
            function e() {
                function e() {
                    return ((65536 * (1 + Math.random())) | 0).toString(16).substring(1);
                }
                return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e();
            }
            for (this.netplay.url = this.config.netplayUrl; this.netplay.url.endsWith("/"); ) this.netplay.url = this.netplay.url.substring(0, this.netplay.url.length - 1);
            (this.netplay.current_frame = 0),
                (this.netplay.getOpenRooms = async () => JSON.parse(await (await fetch(this.netplay.url + "/list?domain=" + window.location.host + "&game_id=" + this.config.gameId)).text())),
                (this.netplay.updateTableList = async () => {
                    var e,
                        t = (t, i, e, n) => {
                            let s = this.createElement("tr");
                            s.classList.add("ejs_netplay_table_row");
                            var o = (e) => {
                                    var t = this.createElement("td");
                                    return (t.innerText = e), (t.style.padding = "10px 0"), (t.style["text-align"] = "center"), s.appendChild(t), t;
                                },
                                o = ((o(i).style["text-align"] = "left"), (o(e + "/" + n).style.width = "80px"), o(""));
                            if (((o.style.width = "80px"), this.netplay.table.appendChild(s), e < n))
                                return (
                                    (e = this.createElement("button")).classList.add("ejs_netplay_join_button"),
                                    e.classList.add("ejs_button_button"),
                                    (e.style["background-color"] = "rgba(var(--ejs-primary-color),1)"),
                                    (e.innerText = this.localization("Join")),
                                    o.appendChild(e),
                                    this.addEventListener(e, "click", (e) => {
                                        this.netplay.joinRoom(t, i);
                                    }),
                                    e
                                );
                        },
                        i = await this.netplay.getOpenRooms();
                    for (e in ((this.netplay.table.innerHTML = ""), i)) t(e, i[e].room_name, i[e].current, i[e].max);
                }),
                (this.netplay.showOpenRoomDialog = () => {
                    let t = this.createSubPopup();
                    this.netplayMenu.appendChild(t[0]), t[1].classList.add("ejs_cheat_parent");
                    var e = t[1],
                        i = this.createElement("div"),
                        n = this.createElement("h2"),
                        n = ((n.innerText = this.localization("Create a room")), n.classList.add("ejs_netplay_name_heading"), i.appendChild(n), e.appendChild(i), this.createElement("div")),
                        i = (n.classList.add("ejs_netplay_header"), this.createElement("strong"));
                    i.innerText = this.localization("Room Name");
                    let s = this.createElement("input");
                    (s.type = "text"), s.setAttribute("maxlength", 20);
                    var o = this.createElement("strong");
                    o.innerText = this.localization("Max Players");
                    let l = this.createElement("select");
                    l.setAttribute("disabled", "disabled");
                    var a = this.createElement("option"),
                        r = ((a.value = 2), (a.innerText = "2"), this.createElement("option")),
                        c = ((r.value = 3), (r.innerText = "3"), this.createElement("option")),
                        a = ((c.value = 4), (c.innerText = "4"), l.appendChild(a), l.appendChild(r), l.appendChild(c), this.createElement("strong"));
                    a.innerText = this.localization("Password (optional)");
                    let d = this.createElement("input");
                    (d.type = "text"),
                        d.setAttribute("maxlength", 20),
                        n.appendChild(i),
                        n.appendChild(this.createElement("br")),
                        n.appendChild(s),
                        n.appendChild(o),
                        n.appendChild(this.createElement("br")),
                        n.appendChild(l),
                        n.appendChild(a),
                        n.appendChild(this.createElement("br")),
                        n.appendChild(d),
                        e.appendChild(n),
                        e.appendChild(this.createElement("br"));
                    (r = this.createElement("button")),
                        r.classList.add("ejs_button_button"),
                        r.classList.add("ejs_popup_submit"),
                        (r.style["background-color"] = "rgba(var(--ejs-primary-color),1)"),
                        (r.style.margin = "0 10px"),
                        (r.innerText = this.localization("Submit")),
                        e.appendChild(r),
                        this.addEventListener(r, "click", (e) => {
                            s.value.trim() && (this.netplay.openRoom(s.value.trim(), parseInt(l.value), d.value.trim()), t[0].remove());
                        }),
                        (c = this.createElement("button"));
                    c.classList.add("ejs_button_button"),
                        c.classList.add("ejs_popup_submit"),
                        (c.style.margin = "0 10px"),
                        (c.innerText = this.localization("Close")),
                        e.appendChild(c),
                        this.addEventListener(c, "click", (e) => {
                            t[0].remove();
                        });
                }),
                (this.netplay.startSocketIO = (e) => {
                    (this.netplay.socket = io(this.netplay.url)),
                        this.netplay.socket.on("connect", () => e()),
                        this.netplay.socket.on("users-updated", (e) => {
                            this.netplay.reset(), this.debug && console.log(e), (this.netplay.players = e), this.netplay.updatePlayersTable(), this.netplay.owner && this.netplay.sync();
                        }),
                        this.netplay.socket.on("disconnect", () => this.netplay.roomLeft()),
                        this.netplay.socket.on("data-message", (e) => {
                            this.netplay.dataMessage(e);
                        });
                }),
                (this.netplay.openRoom = (t, i, n) => {
                    let s = e();
                    (this.netplay.playerID = e()),
                        (this.netplay.players = {}),
                        (this.netplay.extra = { domain: window.location.host, game_id: this.config.gameId, room_name: t, player_name: this.netplay.name, userid: this.netplay.playerID, sessionid: s }),
                        (this.netplay.players[this.netplay.playerID] = this.netplay.extra),
                        (this.netplay.users = {}),
                        this.netplay.startSocketIO((e) => {
                            this.netplay.socket.emit("open-room", { extra: this.netplay.extra, maxPlayers: i, password: n }, (e) => {
                                e ? this.debug && console.log("error: ", e) : this.netplay.roomJoined(!0, t, n, s);
                            });
                        });
                }),
                (this.netplay.leaveRoom = () => {
                    this.debug && console.log("asd"), this.netplay.roomLeft();
                }),
                (this.netplay.joinRoom = (i, n) => {
                    (this.netplay.playerID = e()),
                        (this.netplay.players = {}),
                        (this.netplay.extra = { domain: window.location.host, game_id: this.config.gameId, room_name: n, player_name: this.netplay.name, userid: this.netplay.playerID, sessionid: i }),
                        (this.netplay.players[this.netplay.playerID] = this.netplay.extra),
                        this.netplay.startSocketIO((e) => {
                            this.netplay.socket.emit("join-room", { extra: this.netplay.extra }, (e, t) => {
                                e ? this.debug && console.log("error: ", e) : ((this.netplay.players = t), this.netplay.roomJoined(!1, n, "", i));
                            });
                        });
                }),
                (this.netplay.roomJoined = (e, t, i, n) => {
                    (this.isNetplay = !0),
                        (this.netplay.inputs = {}),
                        (this.netplay.owner = e),
                        this.debug && console.log(this.netplay.extra),
                        (this.netplay.roomNameElem.innerText = t),
                        (this.netplay.tabs[0].style.display = "none"),
                        (this.netplay.tabs[1].style.display = ""),
                        i ? ((this.netplay.passwordElem.style.display = ""), (this.netplay.passwordElem.innerText = this.localization("Password") + ": " + i)) : (this.netplay.passwordElem.style.display = "none"),
                        (this.netplay.createButton.innerText = this.localization("Leave Room")),
                        this.netplay.updatePlayersTable(),
                        this.netplay.owner
                            ? (this.netplay.oldStyles = [this.elements.bottomBar.cheat[0].style.display])
                            : ((this.netplay.oldStyles = [
                                  this.elements.bottomBar.cheat[0].style.display,
                                  this.elements.bottomBar.playPause[0].style.display,
                                  this.elements.bottomBar.playPause[1].style.display,
                                  this.elements.bottomBar.restart[0].style.display,
                                  this.elements.bottomBar.loadState[0].style.display,
                                  this.elements.bottomBar.saveState[0].style.display,
                                  this.elements.bottomBar.saveSavFiles[0].style.display,
                                  this.elements.bottomBar.loadSavFiles[0].style.display,
                                  this.elements.contextMenu.save.style.display,
                                  this.elements.contextMenu.load.style.display,
                              ]),
                              (this.elements.bottomBar.cheat[0].style.display = "none"),
                              (this.elements.bottomBar.playPause[0].style.display = "none"),
                              (this.elements.bottomBar.playPause[1].style.display = "none"),
                              (this.elements.bottomBar.restart[0].style.display = "none"),
                              (this.elements.bottomBar.loadState[0].style.display = "none"),
                              (this.elements.bottomBar.saveState[0].style.display = "none"),
                              (this.elements.bottomBar.saveSavFiles[0].style.display = "none"),
                              (this.elements.bottomBar.loadSavFiles[0].style.display = "none"),
                              (this.elements.contextMenu.save.style.display = "none"),
                              (this.elements.contextMenu.load.style.display = "none"),
                              this.gameManager.resetCheat()),
                        (this.elements.bottomBar.cheat[0].style.display = "none");
                }),
                (this.netplay.updatePlayersTable = () => {
                    let s = this.netplay.playerTable;
                    s.innerHTML = "";
                    var e,
                        t = (e, t) => {
                            let i = this.createElement("tr");
                            var n = (e) => {
                                var t = this.createElement("td");
                                return (t.innerText = e), i.appendChild(t), t;
                            };
                            (n(e).style.width = "80px"), n(t), (n("").style.width = "80px"), s.appendChild(i);
                        };
                    let i = 1;
                    for (e in this.netplay.players) t(i, this.netplay.players[e].player_name), i++;
                }),
                (this.netplay.roomLeft = () => {
                    (this.isNetplay = !1),
                        (this.netplay.tabs[0].style.display = ""),
                        (this.netplay.tabs[1].style.display = "none"),
                        (this.netplay.extra = null),
                        (this.netplay.playerID = null),
                        (this.netplay.createButton.innerText = this.localization("Create a Room")),
                        this.netplay.socket.disconnect(),
                        (this.elements.bottomBar.cheat[0].style.display = this.netplay.oldStyles[0]),
                        this.netplay.owner ||
                            ((this.elements.bottomBar.playPause[0].style.display = this.netplay.oldStyles[1]),
                            (this.elements.bottomBar.playPause[1].style.display = this.netplay.oldStyles[2]),
                            (this.elements.bottomBar.restart[0].style.display = this.netplay.oldStyles[3]),
                            (this.elements.bottomBar.loadState[0].style.display = this.netplay.oldStyles[4]),
                            (this.elements.bottomBar.saveState[0].style.display = this.netplay.oldStyles[5]),
                            (this.elements.bottomBar.saveSavFiles[0].style.display = this.netplay.oldStyles[6]),
                            (this.elements.bottomBar.loadSavFiles[0].style.display = this.netplay.oldStyles[7]),
                            (this.elements.contextMenu.save.style.display = this.netplay.oldStyles[8]),
                            (this.elements.contextMenu.load.style.display = this.netplay.oldStyles[9])),
                        this.updateCheatUI();
                });
            let t = !(this.netplay.setLoading = (e) => {
                this.debug && console.log("loading:", e);
            });
            (this.netplay.sync = async () => {
                var e;
                t ||
                    ((t = !0),
                    this.debug && console.log("sync"),
                    (this.netplay.ready = 0),
                    (e = this.gameManager.getState()),
                    this.netplay.sendMessage({ state: e }),
                    this.netplay.setLoading(!0),
                    this.pause(!0),
                    this.netplay.ready++,
                    (this.netplay.current_frame = 0),
                    this.netplay.ready === this.netplay.getUserCount() && this.play(!0),
                    (t = !1));
            }),
                (this.netplay.getUserIndex = (e) => {
                    let t = 0;
                    for (var i in this.netplay.players) {
                        if (i === e) return t;
                        t++;
                    }
                    return -1;
                });
            this.netplay.getUserCount = () => {
                let e = 0;
                for (var t in this.netplay.players) e++;
                return e;
            };
            (this.netplay.dataMessage = (e) => {
                !0 === e.sync && this.netplay.owner && this.netplay.sync(),
                    e.state && ((this.netplay.wait = !0), this.netplay.setLoading(!0), this.pause(!0), this.gameManager.loadState(new Uint8Array(e.state)), this.netplay.sendMessage({ ready: !0 })),
                    e.play && !this.owner && this.play(!0),
                    e.pause && !this.owner && this.pause(!0),
                    e.ready &&
                        this.netplay.owner &&
                        (this.netplay.ready++, this.netplay.ready === this.netplay.getUserCount()) &&
                        (this.netplay.sendMessage({ readyready: !0 }), this.netplay.reset(), setTimeout(() => this.play(!0), 48), this.netplay.setLoading(!1)),
                    e.readyready && (this.netplay.setLoading(!1), this.netplay.reset(), this.play(!0)),
                    e.shortPause && console.log(e.shortPause),
                    e.shortPause && e.shortPause !== this.netplay.playerID && (this.pause(!0), (this.netplay.wait = !0), setTimeout(() => this.play(!0), 48)),
                    e["sync-control"] &&
                        e["sync-control"].forEach((e) => {
                            let t = parseInt(e.frame);
                            var i = this.netplay.currentFrame;
                            !e.connected_input ||
                                e.connected_input[0] < 0 ||
                                (console.log(e, t, i),
                                t === i && (t++, this.gameManager.functions.simulateInput(e.connected_input[0], e.connected_input[1], e.connected_input[2])),
                                this.netplay.inputsData[t] || (this.netplay.inputsData[t] = []),
                                this.netplay.inputsData[i] || (this.netplay.inputsData[i] = []),
                                this.netplay.owner
                                    ? (this.netplay.inputsData[i].push(e),
                                      this.gameManager.functions.simulateInput(e.connected_input[0], e.connected_input[1], e.connected_input[2]),
                                      i - 10 >= t &&
                                          ((this.netplay.wait = !0),
                                          this.pause(!0),
                                          setTimeout(() => {
                                              this.play(!0), (this.netplay.wait = !1);
                                          }, 48)))
                                    : (this.netplay.inputsData[t].push(e), this.netplay.inputsData[i] && this.play(!0), i + 10 <= t && t > this.netplay.init_frame + 100 && this.netplay.sendMessage({ shortPause: this.netplay.playerID })));
                        }),
                    e.restart && (this.gameManager.restart(), this.netplay.reset(), this.play(!0));
            }),
                (this.netplay.simulateInput = (e, t, i, n) => {
                    this.isNetplay &&
                        (0 === e || n) &&
                        ((e = this.netplay.getUserIndex(this.netplay.playerID)),
                        (n = this.netplay.currentFrame),
                        this.netplay.owner
                            ? (this.netplay.inputsData[n] || (this.netplay.inputsData[n] = []), this.netplay.inputsData[n].push({ frame: n, connected_input: [e, t, i] }), this.gameManager.functions.simulateInput(e, t, i))
                            : this.netplay.sendMessage({ "sync-control": [{ frame: n + 10, connected_input: [e, t, i] }] }));
                }),
                (this.netplay.sendMessage = (e) => {
                    this.netplay.socket.emit("data-message", e);
                }),
                (this.netplay.reset = () => {
                    (this.netplay.init_frame = this.netplay.currentFrame), (this.netplay.inputsData = {});
                }),
                (this.netplay.init_frame = 0),
                (this.netplay.currentFrame = 0),
                (this.netplay.inputsData = {}),
                (this.Module.postMainLoop = () => {
                    if (((this.netplay.currentFrame = parseInt(this.gameManager.getFrameNum()) - this.netplay.init_frame), this.isNetplay)) {
                        if (this.netplay.owner) {
                            let t = [];
                            var e = this.netplay.currentFrame - 1;
                            this.netplay.inputsData[e]
                                ? this.netplay.inputsData[e].forEach((e) => {
                                      (e.frame += 10), t.push(e);
                                  })
                                : t.push({ frame: 10 + e }),
                                this.netplay.sendMessage({ "sync-control": t });
                        } else
                            this.netplay.currentFrame <= 0 || this.netplay.inputsData[this.netplay.currentFrame]
                                ? ((this.netplay.wait = !1),
                                  this.play(),
                                  this.netplay.inputsData[this.netplay.currentFrame].forEach((e) => {
                                      e.connected_input && (console.log(e.connected_input), this.gameManager.functions.simulateInput(e.connected_input[0], e.connected_input[1], e.connected_input[2]));
                                  }))
                                : this.netplay.syncing || (console.log("sync"), this.pause(!0), this.netplay.sendMessage({ sync: !0 }), (this.netplay.syncing = !0));
                        this.netplay.currentFrame % 100 == 0 &&
                            Object.keys(this.netplay.inputsData).forEach((e) => {
                                e < this.netplay.currentFrame - 50 && ((this.netplay.inputsData[e] = null), delete this.netplay.inputsData[e]);
                            });
                    }
                }),
                (this.netplay.updateList = {
                    start: () => {
                        this.netplay.updateList.interval = setInterval(this.netplay.updateTableList.bind(this), 1e3);
                    },
                    stop: () => {
                        clearInterval(this.netplay.updateList.interval);
                    },
                });
        }
        createCheatsMenu() {
            var e = this.createPopup(
                    "Cheats",
                    {
                        "Add Cheat": () => {
                            let t = this.createSubPopup();
                            this.cheatMenu.appendChild(t[0]), t[1].classList.add("ejs_cheat_parent"), (t[1].style.width = "100%");
                            var e = t[1],
                                i = this.createElement("div"),
                                n = (i.classList.add("ejs_cheat_header"), this.createElement("h2")),
                                s = ((n.innerText = this.localization("Add Cheat Code")), n.classList.add("ejs_cheat_heading"), this.createElement("button")),
                                n =
                                    (s.classList.add("ejs_cheat_close"),
                                    i.appendChild(n),
                                    i.appendChild(s),
                                    e.appendChild(i),
                                    this.addEventListener(s, "click", (e) => {
                                        t[0].remove();
                                    }),
                                    this.createElement("div")),
                                i = (n.classList.add("ejs_cheat_main"), this.createElement("strong"));
                            (i.innerText = this.localization("Code")), n.appendChild(i), n.appendChild(this.createElement("br"));
                            let o = this.createElement("textarea");
                            o.classList.add("ejs_cheat_code"), (o.style.width = "100%"), (o.style.height = "80px"), n.appendChild(o), n.appendChild(this.createElement("br"));
                            s = this.createElement("strong");
                            (s.innerText = this.localization("Description")), n.appendChild(s), n.appendChild(this.createElement("br"));
                            let l = this.createElement("input");
                            (l.type = "text"), l.classList.add("ejs_cheat_code"), n.appendChild(l), n.appendChild(this.createElement("br")), e.appendChild(n);
                            var i = this.createElement("footer"),
                                s = this.createElement("button"),
                                n = this.createElement("button"),
                                a =
                                    ((s.innerText = this.localization("Submit")),
                                    (n.innerText = this.localization("Close")),
                                    s.classList.add("ejs_button_button"),
                                    n.classList.add("ejs_button_button"),
                                    s.classList.add("ejs_popup_submit"),
                                    n.classList.add("ejs_popup_submit"),
                                    (s.style["background-color"] = "rgba(var(--ejs-primary-color),1)"),
                                    i.appendChild(s),
                                    this.createElement("span"));
                            (a.innerText = " "),
                                i.appendChild(a),
                                i.appendChild(n),
                                e.appendChild(i),
                                this.addEventListener(s, "click", (e) => {
                                    o.value.trim() && l.value.trim() && (t[0].remove(), this.cheats.push({ code: o.value, desc: l.value, checked: !1 }), this.updateCheatUI(), this.saveSettings());
                                }),
                                this.addEventListener(n, "click", (e) => {
                                    t[0].remove();
                                });
                        },
                        Close: () => {
                            this.cheatMenu.style.display = "none";
                        },
                    },
                    !0
                ),
                t = ((this.cheatMenu = e.parentElement), (this.cheatMenu.getElementsByTagName("h4")[0].style["padding-bottom"] = "0px"), this.createElement("div")),
                t = ((t.style["padding-top"] = "0px"), (t.style["padding-bottom"] = "15px"), (t.innerText = this.localization("Note that some cheats require a restart to disable")), e.appendChild(t), this.createElement("div"));
            e.appendChild(t), t.classList.add("ejs_cheat_rows"), (this.elements.cheatRows = t);
        }
        updateCheatUI() {
            if (this.gameManager) {
                this.elements.cheatRows.innerHTML = "";
                var t = (e, t, i, n, s) => {
                    var o = this.createElement("div");
                    o.classList.add("ejs_cheat_row");
                    let l = this.createElement("input");
                    (l.type = "checkbox"), (l.checked = t), (l.value = s), (l.id = "ejs_cheat_switch_" + s), o.appendChild(l);
                    var a = this.createElement("label");
                    (a.for = "ejs_cheat_switch_" + s),
                        (a.innerText = e),
                        o.appendChild(a),
                        a.addEventListener("click", (e) => {
                            (l.checked = !l.checked), (this.cheats[s].checked = l.checked), this.cheatChanged(l.checked, i, s), this.saveSettings();
                        }),
                        n ||
                            ((e = this.createElement("a")).classList.add("ejs_cheat_row_button"),
                            (e.innerText = "×"),
                            o.appendChild(e),
                            e.addEventListener("click", (e) => {
                                this.cheatChanged(!1, i, s), this.cheats.splice(s, 1), this.updateCheatUI(), this.saveSettings();
                            })),
                        this.elements.cheatRows.appendChild(o),
                        this.cheatChanged(t, i, s);
                };
                this.gameManager.resetCheat();
                for (let e = 0; e < this.cheats.length; e++) t(this.cheats[e].desc, this.cheats[e].checked, this.cheats[e].code, this.cheats[e].is_permanent, e);
            }
        }
        cheatChanged(e, t, i) {
            this.gameManager && this.gameManager.setCheat(i, e, t);
        }
        enableShader(e) {
            if (this.gameManager) {
                try {
                    this.Module.FS.unlink("/shader/shader.glslp");
                } catch (e) {}
                var t;
                "disabled" !== e && this.config.shaders[e]
                    ? ("string" == typeof (e = this.config.shaders[e])
                          ? this.Module.FS.writeFile("/shader/shader.glslp", e, {}, "w+")
                          : ((t = e.shader),
                            this.Module.FS.writeFile("/shader/shader.glslp", "base64" === t.type ? atob(t.value) : t.value, {}, "w+"),
                            e.resources &&
                                e.resources.length &&
                                e.resources.forEach((e) => {
                                    this.Module.FS.writeFile("/shader/" + e.name, "base64" === e.type ? atob(e.value) : e.value, {}, "w+");
                                })),
                      this.gameManager.toggleShader(1))
                    : this.gameManager.toggleShader(0);
            }
        }
        collectScreenRecordingMediaTracks(e, i) {
            let t = null;
            e = e.captureStream(i).getVideoTracks();
            if (0 === e.length) return console.error("Unable to capture video stream"), null;
            t = e[0];
            let n = null;
            if (this.Module.AL && this.Module.AL.currentCtx && this.Module.AL.currentCtx.audioCtx) {
                var s,
                    o = this.Module.AL.currentCtx,
                    i = o.audioCtx,
                    l = [];
                for (s in o.sources) l.push(o.sources[s].gain);
                let t = i.createChannelMerger(l.length);
                l.forEach((e) => e.connect(t));
                (e = i.createMediaStreamDestination()), (i = (t.connect(e), e.stream.getAudioTracks()));
                0 !== i.length && (n = i[0]);
            }
            e = new MediaStream();
            return t && "live" === t.readyState && e.addTrack(t), n && "live" === n.readyState && e.addTrack(n), e;
        }
        screenRecord() {
            let s = this.config.screenRecording && "number" == typeof this.config.screenRecording.width ? this.config.screenRecording.width : 800,
                o = this.config.screenRecording && "number" == typeof this.config.screenRecording.height ? this.config.screenRecording.height : 600;
            var e = this.config.screenRecording && "number" == typeof this.config.screenRecording.fps ? this.config.screenRecording.fps : 30,
                t = this.config.screenRecording && "number" == typeof this.config.screenRecording.videoBitrate ? this.config.screenRecording.videoBitrate : 2076672,
                i = this.config.screenRecording && "number" == typeof this.config.screenRecording.audioBitrate ? this.config.screenRecording.audioBitrate : 262144;
            let n = document.createElement("canvas"),
                l = ((n.width = s), (n.height = o), (n.style.position = "absolute"), (n.style.top = "-999px"), (n.style.bottom = "-999px"), document.getElementsByTagName("body")[0].append(n), n.getContext("2d", { alpha: !1 })),
                a = ((l.fillStyle = "#000"), !0),
                r = () => {
                    var e = s / this.canvas.width,
                        t = o / this.canvas.height,
                        t = Math.max(t, e),
                        e = this.canvas.width * t,
                        t = this.canvas.height * t,
                        i = (s - e) / 2,
                        n = (o - t) / 2;
                    l.drawImage(this.canvas, Math.round(i), Math.round(n), Math.round(e), Math.round(t)), a && requestAnimationFrame(r);
                },
                c = (requestAnimationFrame(r), []);
            (e = this.collectScreenRecordingMediaTracks(n, e)), (e = new MediaRecorder(e, { videoBitsPerSecond: t, audioBitsPerSecond: i }));
            return (
                e.addEventListener("dataavailable", (e) => {
                    c.push(e.data);
                }),
                e.addEventListener("stop", () => {
                    var e = new Blob(c),
                        e = URL.createObjectURL(e),
                        t = new Date(),
                        i = document.createElement("a");
                    (i.href = e), (i.download = this.getBaseFileName() + "-" + t.getMonth() + "-" + t.getDate() + "-" + t.getFullYear() + ".webm"), i.click(), (a = !1), n.remove();
                }),
                e.start(),
                e
            );
        }
    }
    var t, i;
    (window.EmulatorJS = e),
        (t = window),
        (i = function () {
            return (
                (i = [
                    function (e, t, i) {
                        i.r(t);
                        function b(e, t) {
                            var i = t.x - e.x,
                                t = t.y - e.y;
                            return Math.sqrt(i * i + t * t);
                        }
                        function Z(e) {
                            return e * (Math.PI / 180);
                        }
                        function s(e) {
                            u.has(e) && clearTimeout(u.get(e)), u.set(e, setTimeout(e, 100));
                        }
                        function o(e, t, i) {
                            for (var n, s = t.split(/[ ,]+/g), o = 0; o < s.length; o += 1) (n = s[o]), e.addEventListener ? e.addEventListener(n, i, !1) : e.attachEvent && e.attachEvent(n, i);
                        }
                        function n(e, t, i) {
                            for (var n, s = t.split(/[ ,]+/g), o = 0; o < s.length; o += 1) (n = s[o]), e.removeEventListener ? e.removeEventListener(n, i) : e.detachEvent && e.detachEvent(n, i);
                        }
                        function l(e) {
                            return e.preventDefault(), e.type.match(/^touch/) ? e.changedTouches : e;
                        }
                        function a() {
                            return {
                                x: void 0 !== window.pageXOffset ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
                                y: void 0 !== window.pageYOffset ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
                            };
                        }
                        function r(e, t) {
                            t.top || t.right || t.bottom || t.left ? ((e.style.top = t.top), (e.style.right = t.right), (e.style.bottom = t.bottom), (e.style.left = t.left)) : ((e.style.left = t.x + "px"), (e.style.top = t.y + "px"));
                        }
                        function c(e, t, i) {
                            var n,
                                s = d(e);
                            for (n in s)
                                if (s.hasOwnProperty(n))
                                    if ("string" == typeof t) s[n] = t + " " + i;
                                    else {
                                        for (var o = "", l = 0, a = t.length; l < a; l += 1) o += t[l] + " " + i + ", ";
                                        s[n] = o.slice(0, -2);
                                    }
                            return s;
                        }
                        function d(t) {
                            var i = {};
                            return (
                                (i[t] = ""),
                                ["webkit", "Moz", "o"].forEach(function (e) {
                                    i[e + t.charAt(0).toUpperCase() + t.slice(1)] = "";
                                }),
                                i
                            );
                        }
                        function g(e, t) {
                            for (var i in t) t.hasOwnProperty(i) && (e[i] = t[i]);
                        }
                        function h(e, t) {
                            if (e.length) for (var i = 0, n = e.length; i < n; i += 1) t(e[i]);
                            else t(e);
                        }
                        var p,
                            u = new Map(),
                            i = !!("ontouchstart" in window),
                            m = !!window.PointerEvent,
                            I = { start: "mousedown", move: "mousemove", end: "mouseup" },
                            C = {};
                        function y() {}
                        m
                            ? (p = { start: "pointerdown", move: "pointermove", end: "pointerup, pointercancel" })
                            : !!window.MSPointerEvent
                            ? (p = { start: "MSPointerDown", move: "MSPointerMove", end: "MSPointerUp" })
                            : i
                            ? ((p = { start: "touchstart", move: "touchmove", end: "touchend, touchcancel" }), (C = I))
                            : (p = I),
                            (y.prototype.on = function (e, t) {
                                var i,
                                    n = e.split(/[ ,]+/g);
                                this._handlers_ = this._handlers_ || {};
                                for (var s = 0; s < n.length; s += 1) (i = n[s]), (this._handlers_[i] = this._handlers_[i] || []), this._handlers_[i].push(t);
                                return this;
                            }),
                            (y.prototype.off = function (e, t) {
                                return (
                                    (this._handlers_ = this._handlers_ || {}),
                                    void 0 === e
                                        ? (this._handlers_ = {})
                                        : void 0 === t
                                        ? (this._handlers_[e] = null)
                                        : this._handlers_[e] && 0 <= this._handlers_[e].indexOf(t) && this._handlers_[e].splice(this._handlers_[e].indexOf(t), 1),
                                    this
                                );
                            }),
                            (y.prototype.trigger = function (e, t) {
                                var i,
                                    n = this,
                                    s = e.split(/[ ,]+/g);
                                n._handlers_ = n._handlers_ || {};
                                for (var o = 0; o < s.length; o += 1)
                                    (i = s[o]),
                                        n._handlers_[i] &&
                                            n._handlers_[i].length &&
                                            n._handlers_[i].forEach(function (e) {
                                                e.call(n, { type: i, target: n }, t);
                                            });
                            }),
                            (y.prototype.config = function (e) {
                                (this.options = this.defaults || {}),
                                    e &&
                                        (this.options = ((e, t) => {
                                            var i,
                                                n = {};
                                            for (i in e) e.hasOwnProperty(i) && t.hasOwnProperty(i) ? (n[i] = t[i]) : e.hasOwnProperty(i) && (n[i] = e[i]);
                                            return n;
                                        })(this.options, e));
                            }),
                            (y.prototype.bindEvt = function (e, t) {
                                var i = this;
                                return (
                                    (i._domHandlers_ = i._domHandlers_ || {}),
                                    (i._domHandlers_[t] = function () {
                                        "function" == typeof i["on" + t] ? i["on" + t].apply(i, arguments) : console.warn('[WARNING] : Missing "on' + t + '" handler.');
                                    }),
                                    o(e, p[t], i._domHandlers_[t]),
                                    C[t] && o(e, C[t], i._domHandlers_[t]),
                                    i
                                );
                            }),
                            (y.prototype.unbindEvt = function (e, t) {
                                return (this._domHandlers_ = this._domHandlers_ || {}), n(e, p[t], this._domHandlers_[t]), C[t] && n(e, C[t], this._domHandlers_[t]), delete this._domHandlers_[t], this;
                            });
                        m = y;
                        function V(e, t) {
                            return (
                                (this.identifier = t.identifier),
                                (this.position = t.position),
                                (this.frontPosition = t.frontPosition),
                                (this.collection = e),
                                (this.defaults = { size: 100, threshold: 0.1, color: "white", fadeTime: 250, dataOnly: !1, restJoystick: !0, restOpacity: 0.5, mode: "dynamic", zone: document.body, lockX: !1, lockY: !1, shape: "circle" }),
                                this.config(t),
                                "dynamic" === this.options.mode && (this.options.restOpacity = 0),
                                (this.id = V.id),
                                (V.id += 1),
                                this.buildEl().stylize(),
                                (this.instance = {
                                    el: this.ui.el,
                                    on: this.on.bind(this),
                                    off: this.off.bind(this),
                                    show: this.show.bind(this),
                                    hide: this.hide.bind(this),
                                    add: this.addToDom.bind(this),
                                    remove: this.removeFromDom.bind(this),
                                    destroy: this.destroy.bind(this),
                                    setPosition: this.setPosition.bind(this),
                                    resetDirection: this.resetDirection.bind(this),
                                    computeDirection: this.computeDirection.bind(this),
                                    trigger: this.trigger.bind(this),
                                    position: this.position,
                                    frontPosition: this.frontPosition,
                                    ui: this.ui,
                                    identifier: this.identifier,
                                    id: this.id,
                                    options: this.options,
                                }),
                                this.instance
                            );
                        }
                        (V.prototype = new m()),
                            ((V.constructor = V).id = 0),
                            (V.prototype.buildEl = function (e) {
                                return (
                                    (this.ui = {}),
                                    this.options.dataOnly ||
                                        ((this.ui.el = document.createElement("div")),
                                        (this.ui.back = document.createElement("div")),
                                        (this.ui.front = document.createElement("div")),
                                        (this.ui.el.className = "nipple collection_" + this.collection.id),
                                        (this.ui.back.className = "back"),
                                        (this.ui.front.className = "front"),
                                        this.ui.el.setAttribute("id", "nipple_" + this.collection.id + "_" + this.id),
                                        this.ui.el.appendChild(this.ui.back),
                                        this.ui.el.appendChild(this.ui.front)),
                                    this
                                );
                            }),
                            (V.prototype.stylize = function () {
                                var e, t, i;
                                return (
                                    this.options.dataOnly ||
                                        ((t = this.options.fadeTime + "ms"),
                                        (e = (() => {
                                            var e,
                                                t = d("borderRadius");
                                            for (e in t) t.hasOwnProperty(e) && (t[e] = "50%");
                                            return t;
                                        })()),
                                        (t = c("transition", "opacity", t)),
                                        ((i = {}).el = { position: "absolute", opacity: this.options.restOpacity, display: "block", zIndex: 999 }),
                                        (i.back = {
                                            position: "absolute",
                                            display: "block",
                                            width: this.options.size + "px",
                                            height: this.options.size + "px",
                                            marginLeft: -this.options.size / 2 + "px",
                                            marginTop: -this.options.size / 2 + "px",
                                            background: this.options.color,
                                            opacity: ".5",
                                        }),
                                        (i.front = {
                                            width: this.options.size / 2 + "px",
                                            height: this.options.size / 2 + "px",
                                            position: "absolute",
                                            display: "block",
                                            marginLeft: -this.options.size / 4 + "px",
                                            marginTop: -this.options.size / 4 + "px",
                                            background: this.options.color,
                                            opacity: ".5",
                                            transform: "translate(0px, 0px)",
                                        }),
                                        g(i.el, t),
                                        "circle" === this.options.shape && g(i.back, e),
                                        g(i.front, e),
                                        this.applyStyles(i)),
                                    this
                                );
                            }),
                            (V.prototype.applyStyles = function (e) {
                                for (var t in this.ui) if (this.ui.hasOwnProperty(t)) for (var i in e[t]) this.ui[t].style[i] = e[t][i];
                                return this;
                            }),
                            (V.prototype.addToDom = function () {
                                return this.options.dataOnly || document.body.contains(this.ui.el) || this.options.zone.appendChild(this.ui.el), this;
                            }),
                            (V.prototype.removeFromDom = function () {
                                return !this.options.dataOnly && document.body.contains(this.ui.el) && this.options.zone.removeChild(this.ui.el), this;
                            }),
                            (V.prototype.destroy = function () {
                                clearTimeout(this.removeTimeout), clearTimeout(this.showTimeout), clearTimeout(this.restTimeout), this.trigger("destroyed", this.instance), this.removeFromDom(), this.off();
                            }),
                            (V.prototype.show = function (e) {
                                var t = this;
                                return (
                                    t.options.dataOnly ||
                                        (clearTimeout(t.removeTimeout),
                                        clearTimeout(t.showTimeout),
                                        clearTimeout(t.restTimeout),
                                        t.addToDom(),
                                        t.restCallback(),
                                        setTimeout(function () {
                                            t.ui.el.style.opacity = 1;
                                        }, 0),
                                        (t.showTimeout = setTimeout(function () {
                                            t.trigger("shown", t.instance), "function" == typeof e && e.call(this);
                                        }, t.options.fadeTime))),
                                    t
                                );
                            }),
                            (V.prototype.hide = function (t) {
                                var e,
                                    i,
                                    n = this;
                                return (
                                    n.options.dataOnly ||
                                        ((n.ui.el.style.opacity = n.options.restOpacity),
                                        clearTimeout(n.removeTimeout),
                                        clearTimeout(n.showTimeout),
                                        clearTimeout(n.restTimeout),
                                        (n.removeTimeout = setTimeout(function () {
                                            var e = "dynamic" === n.options.mode ? "none" : "block";
                                            (n.ui.el.style.display = e), "function" == typeof t && t.call(n), n.trigger("hidden", n.instance);
                                        }, n.options.fadeTime)),
                                        n.options.restJoystick &&
                                            ((e = n.options.restJoystick), ((i = {}).x = !0 === e || !1 !== e.x ? 0 : n.instance.frontPosition.x), (i.y = !0 === e || !1 !== e.y ? 0 : n.instance.frontPosition.y), n.setPosition(t, i))),
                                    n
                                );
                            }),
                            (V.prototype.setPosition = function (e, t) {
                                var i = this,
                                    t = ((i.frontPosition = { x: t.x, y: t.y }), i.options.fadeTime + "ms"),
                                    n = {},
                                    t = ((n.front = c("transition", ["transform"], t)), { front: {} });
                                (t.front = { transform: "translate(" + i.frontPosition.x + "px," + i.frontPosition.y + "px)" }),
                                    i.applyStyles(n),
                                    i.applyStyles(t),
                                    (i.restTimeout = setTimeout(function () {
                                        "function" == typeof e && e.call(i), i.restCallback();
                                    }, i.options.fadeTime));
                            }),
                            (V.prototype.restCallback = function () {
                                var e = {};
                                (e.front = c("transition", "none", "")), this.applyStyles(e), this.trigger("rested", this.instance);
                            }),
                            (V.prototype.resetDirection = function () {
                                this.direction = { x: !1, y: !1, angle: !1 };
                            }),
                            (V.prototype.computeDirection = function (e) {
                                var t,
                                    i,
                                    n,
                                    s = e.angle.radian,
                                    o = Math.PI / 4,
                                    l = Math.PI / 2;
                                if (
                                    (o < s && s < 3 * o && !e.lockX ? (t = "up") : -o < s && s <= o && !e.lockY ? (t = "left") : 3 * -o < s && s <= -o && !e.lockX ? (t = "down") : e.lockY || (t = "right"),
                                    e.lockY || (i = -l < s && s < l ? "left" : "right"),
                                    e.lockX || (n = 0 < s ? "up" : "down"),
                                    e.force > this.options.threshold)
                                ) {
                                    var a,
                                        r = {};
                                    for (a in this.direction) this.direction.hasOwnProperty(a) && (r[a] = this.direction[a]);
                                    var c = {};
                                    for (a in ((this.direction = { x: i, y: n, angle: t }), (e.direction = this.direction), r)) r[a] === this.direction[a] && (c[a] = !0);
                                    if (c.x && c.y && c.angle) return e;
                                    (c.x && c.y) || this.trigger("plain", e), c.x || this.trigger("plain:" + i, e), c.y || this.trigger("plain:" + n, e), c.angle || this.trigger("dir dir:" + t, e);
                                } else this.resetDirection();
                                return e;
                            });
                        var B = V;
                        function S(e, t) {
                            (this.nipples = []),
                                (this.idles = []),
                                (this.actives = []),
                                (this.ids = []),
                                (this.pressureIntervals = {}),
                                (this.manager = e),
                                (this.id = S.id),
                                (S.id += 1),
                                (this.defaults = {
                                    zone: document.body,
                                    multitouch: !1,
                                    maxNumberOfNipples: 10,
                                    mode: "dynamic",
                                    position: { top: 0, left: 0 },
                                    catchDistance: 200,
                                    size: 100,
                                    threshold: 0.1,
                                    color: "white",
                                    fadeTime: 250,
                                    dataOnly: !1,
                                    restJoystick: !0,
                                    restOpacity: 0.5,
                                    lockX: !1,
                                    lockY: !1,
                                    shape: "circle",
                                    dynamicPage: !1,
                                    follow: !1,
                                }),
                                this.config(t),
                                ("static" !== this.options.mode && "semi" !== this.options.mode) || (this.options.multitouch = !1),
                                this.options.multitouch || (this.options.maxNumberOfNipples = 1);
                            e = getComputedStyle(this.options.zone.parentElement);
                            return e && "flex" === e.display && (this.parentIsFlex = !0), this.updateBox(), this.prepareNipples(), this.bindings(), this.begin(), this.nipples;
                        }
                        (S.prototype = new m()),
                            ((S.constructor = S).id = 0),
                            (S.prototype.prepareNipples = function () {
                                var n = this.nipples;
                                (n.on = this.on.bind(this)),
                                    (n.off = this.off.bind(this)),
                                    (n.options = this.options),
                                    (n.destroy = this.destroy.bind(this)),
                                    (n.ids = this.ids),
                                    (n.id = this.id),
                                    (n.processOnMove = this.processOnMove.bind(this)),
                                    (n.processOnEnd = this.processOnEnd.bind(this)),
                                    (n.get = function (e) {
                                        if (void 0 === e) return n[0];
                                        for (var t = 0, i = n.length; t < i; t += 1) if (n[t].identifier === e) return n[t];
                                        return !1;
                                    });
                            }),
                            (S.prototype.bindings = function () {
                                this.bindEvt(this.options.zone, "start"), (this.options.zone.style.touchAction = "none"), (this.options.zone.style.msTouchAction = "none");
                            }),
                            (S.prototype.begin = function () {
                                var e = this.options;
                                "static" === e.mode && ((e = this.createNipple(e.position, this.manager.getIdentifier())).add(), this.idles.push(e));
                            }),
                            (S.prototype.createNipple = function (e, t) {
                                var i = this.manager.scroll,
                                    n = {},
                                    s = this.options,
                                    o = this.parentIsFlex ? i.x : i.x + this.box.left,
                                    l = this.parentIsFlex ? i.y : i.y + this.box.top,
                                    o =
                                        (e.x && e.y
                                            ? (n = { x: e.x - o, y: e.y - l })
                                            : (e.top || e.right || e.bottom || e.left) &&
                                              (((o = document.createElement("DIV")).style.display = "hidden"),
                                              (o.style.top = e.top),
                                              (o.style.right = e.right),
                                              (o.style.bottom = e.bottom),
                                              (o.style.left = e.left),
                                              (o.style.position = "absolute"),
                                              s.zone.appendChild(o),
                                              (l = o.getBoundingClientRect()),
                                              s.zone.removeChild(o),
                                              (n = e),
                                              (e = { x: l.left + i.x, y: l.top + i.y })),
                                        new B(this, {
                                            color: s.color,
                                            size: s.size,
                                            threshold: s.threshold,
                                            fadeTime: s.fadeTime,
                                            dataOnly: s.dataOnly,
                                            restJoystick: s.restJoystick,
                                            restOpacity: s.restOpacity,
                                            mode: s.mode,
                                            identifier: t,
                                            position: e,
                                            zone: s.zone,
                                            frontPosition: { x: 0, y: 0 },
                                            shape: s.shape,
                                        }));
                                return (
                                    s.dataOnly || (r(o.ui.el, n), r(o.ui.front, o.frontPosition)),
                                    this.nipples.push(o),
                                    this.trigger("added " + o.identifier + ":added", o),
                                    this.manager.trigger("added " + o.identifier + ":added", o),
                                    this.bindNipple(o),
                                    o
                                );
                            }),
                            (S.prototype.updateBox = function () {
                                this.box = this.options.zone.getBoundingClientRect();
                            }),
                            (S.prototype.bindNipple = function (e) {
                                function t(e, t) {
                                    (i = e.type + " " + t.id + ":" + e.type), n.trigger(i, t);
                                }
                                var i,
                                    n = this;
                                e.on("destroyed", n.onDestroyed.bind(n)), e.on("shown hidden rested dir plain", t), e.on("dir:up dir:right dir:down dir:left", t), e.on("plain:up plain:right plain:down plain:left", t);
                            }),
                            (S.prototype.pressureFn = function (t, i, e) {
                                var n = this,
                                    s = 0;
                                clearInterval(n.pressureIntervals[e]),
                                    (n.pressureIntervals[e] = setInterval(
                                        function () {
                                            var e = t.force || t.pressure || t.webkitForce || 0;
                                            e !== s && (i.trigger("pressure", e), n.trigger("pressure " + i.identifier + ":pressure", e), (s = e));
                                        }.bind(n),
                                        100
                                    ));
                            }),
                            (S.prototype.onstart = function (i) {
                                var n = this,
                                    t = n.options,
                                    s = i;
                                return (
                                    (i = l(i)),
                                    n.updateBox(),
                                    h(i, function (e) {
                                        (n.actives.length < t.maxNumberOfNipples ||
                                            (s.type.match(/^touch/) &&
                                                (Object.keys(n.manager.ids).forEach(function (t) {
                                                    var e;
                                                    Object.values(s.touches).findIndex(function (e) {
                                                        return e.identifier === t;
                                                    }) < 0 && (((e = [i[0]]).identifier = t), n.processOnEnd(e));
                                                }),
                                                n.actives.length < t.maxNumberOfNipples))) &&
                                            n.processOnStart(e);
                                    }),
                                    n.manager.bindDocument(),
                                    !1
                                );
                            }),
                            (S.prototype.processOnStart = function (t) {
                                function e(e) {
                                    e.trigger("start", e), i.trigger("start " + e.id + ":start", e), e.show(), 0 < o && i.pressureFn(t, e, e.identifier), i.processOnMove(t);
                                }
                                var i = this,
                                    n = i.options,
                                    s = i.manager.getIdentifier(t),
                                    o = t.force || t.pressure || t.webkitForce || 0,
                                    l = { x: t.pageX, y: t.pageY },
                                    a = i.getOrCreate(s, l);
                                a.identifier !== s && i.manager.removeIdentifier(a.identifier), (a.identifier = s);
                                if ((0 <= (s = i.idles.indexOf(a)) && i.idles.splice(s, 1), i.actives.push(a), i.ids.push(a.identifier), "semi" !== n.mode || b(l, a.position) <= n.catchDistance)) return e(a), a;
                                a.destroy(), i.processOnStart(t);
                            }),
                            (S.prototype.getOrCreate = function (e, t) {
                                var i,
                                    n = this.options;
                                return /(semi|static)/.test(n.mode)
                                    ? (i = this.idles[0])
                                        ? (this.idles.splice(0, 1), i)
                                        : "semi" === n.mode
                                        ? this.createNipple(t, e)
                                        : (console.warn("Coudln't find the needed nipple."), !1)
                                    : this.createNipple(t, e);
                            }),
                            (S.prototype.processOnMove = function (e) {
                                var t,
                                    i,
                                    n,
                                    s,
                                    o,
                                    l,
                                    a,
                                    r,
                                    c,
                                    d,
                                    g,
                                    h,
                                    p,
                                    u,
                                    m = this.options,
                                    I = this.manager.getIdentifier(e),
                                    C = this.nipples.get(I),
                                    y = this.manager.scroll;
                                (u = e),
                                    (isNaN(u.buttons) ? 0 !== u.pressure : 0 !== u.buttons)
                                        ? C
                                            ? (m.dynamicPage && ((u = C.el.getBoundingClientRect()), (C.position = { x: y.x + u.left, y: y.y + u.top })),
                                              (C.identifier = I),
                                              (u = C.options.size / 2),
                                              (t = { x: e.pageX, y: e.pageY }),
                                              m.lockX && (t.y = C.position.y),
                                              m.lockY && (t.x = C.position.x),
                                              (s = b(t, C.position)),
                                              (l = t),
                                              (o = C.position),
                                              (a = o.x - l.x),
                                              (o = Math.atan2(o.y - l.y, a) * (180 / Math.PI)),
                                              (l = Z(o)),
                                              (a = s / u),
                                              (r = { distance: s, position: t }),
                                              "circle" === C.options.shape
                                                  ? ((i = Math.min(s, u)), (n = C.position), (g = i), (p = { x: 0, y: 0 }), (h = Z(o)), (p.x = n.x - g * Math.cos(h)), (p.y = n.y - g * Math.sin(h)), (n = p))
                                                  : ((g = t), (h = C.position), (p = u), (n = { x: Math.min(Math.max(g.x, h.x - p), h.x + p), y: Math.min(Math.max(g.y, h.y - p), h.y + p) }), (i = b(n, C.position))),
                                              m.follow
                                                  ? u < s &&
                                                    ((c = t.x - n.x),
                                                    (d = t.y - n.y),
                                                    (C.position.x += c),
                                                    (C.position.y += d),
                                                    (C.el.style.top = C.position.y - (this.box.top + y.y) + "px"),
                                                    (C.el.style.left = C.position.x - (this.box.left + y.x) + "px"),
                                                    (s = b(t, C.position)))
                                                  : ((t = n), (s = i)),
                                              (c = t.x - C.position.x),
                                              (d = t.y - C.position.y),
                                              (C.frontPosition = { x: c, y: d }),
                                              m.dataOnly || (C.ui.front.style.transform = "translate(" + c + "px," + d + "px)"),
                                              (y = {
                                                  identifier: C.identifier,
                                                  position: t,
                                                  force: a,
                                                  pressure: e.force || e.pressure || e.webkitForce || 0,
                                                  distance: s,
                                                  angle: { radian: l, degree: o },
                                                  vector: { x: c / u, y: -d / u },
                                                  raw: r,
                                                  instance: C,
                                                  lockX: m.lockX,
                                                  lockY: m.lockY,
                                              }),
                                              ((y = C.computeDirection(y)).angle = { radian: Z(180 - o), degree: 180 - o }),
                                              C.trigger("move", y),
                                              this.trigger("move " + C.id + ":move", y))
                                            : (console.error("Found zombie joystick with ID " + I), this.manager.removeIdentifier(I))
                                        : this.processOnEnd(e);
                            }),
                            (S.prototype.processOnEnd = function (e) {
                                var t = this,
                                    i = t.options,
                                    e = t.manager.getIdentifier(e),
                                    n = t.nipples.get(e),
                                    e = t.manager.removeIdentifier(n.identifier);
                                n &&
                                    (i.dataOnly ||
                                        n.hide(function () {
                                            "dynamic" === i.mode && (n.trigger("removed", n), t.trigger("removed " + n.id + ":removed", n), t.manager.trigger("removed " + n.id + ":removed", n), n.destroy());
                                        }),
                                    clearInterval(t.pressureIntervals[n.identifier]),
                                    n.resetDirection(),
                                    n.trigger("end", n),
                                    t.trigger("end " + n.id + ":end", n),
                                    0 <= t.ids.indexOf(n.identifier) && t.ids.splice(t.ids.indexOf(n.identifier), 1),
                                    0 <= t.actives.indexOf(n) && t.actives.splice(t.actives.indexOf(n), 1),
                                    /(semi|static)/.test(i.mode) ? t.idles.push(n) : 0 <= t.nipples.indexOf(n) && t.nipples.splice(t.nipples.indexOf(n), 1),
                                    t.manager.unbindDocument(),
                                    /(semi|static)/.test(i.mode)) &&
                                    (t.manager.ids[e.id] = e.identifier);
                            }),
                            (S.prototype.onDestroyed = function (e, t) {
                                0 <= this.nipples.indexOf(t) && this.nipples.splice(this.nipples.indexOf(t), 1),
                                    0 <= this.actives.indexOf(t) && this.actives.splice(this.actives.indexOf(t), 1),
                                    0 <= this.idles.indexOf(t) && this.idles.splice(this.idles.indexOf(t), 1),
                                    0 <= this.ids.indexOf(t.identifier) && this.ids.splice(this.ids.indexOf(t.identifier), 1),
                                    this.manager.removeIdentifier(t.identifier),
                                    this.manager.unbindDocument();
                            }),
                            (S.prototype.destroy = function () {
                                for (var e in (this.unbindEvt(this.options.zone, "start"),
                                this.nipples.forEach(function (e) {
                                    e.destroy();
                                }),
                                this.pressureIntervals))
                                    this.pressureIntervals.hasOwnProperty(e) && clearInterval(this.pressureIntervals[e]);
                                this.trigger("destroyed", this.nipples), this.manager.unbindDocument(), this.off();
                            });
                        var f = S;
                        function A(e) {
                            function t() {
                                var t;
                                n.collections.forEach(function (e) {
                                    e.forEach(function (e) {
                                        (t = e.el.getBoundingClientRect()), (e.position = { x: n.scroll.x + t.left, y: n.scroll.y + t.top });
                                    });
                                });
                            }
                            function i() {
                                n.scroll = a();
                            }
                            var n = this;
                            (n.ids = {}),
                                (n.index = 0),
                                (n.collections = []),
                                (n.scroll = a()),
                                n.config(e),
                                n.prepareCollections(),
                                o(window, "resize", function () {
                                    s(t);
                                });
                            return (
                                o(window, "scroll", function () {
                                    s(i);
                                }),
                                n.collections
                            );
                        }
                        (A.prototype = new m()),
                            ((A.constructor = A).prototype.prepareCollections = function () {
                                var e = this;
                                (e.collections.create = e.create.bind(e)),
                                    (e.collections.on = e.on.bind(e)),
                                    (e.collections.off = e.off.bind(e)),
                                    (e.collections.destroy = e.destroy.bind(e)),
                                    (e.collections.get = function (t) {
                                        var i;
                                        return (
                                            e.collections.every(function (e) {
                                                return !(i = e.get(t));
                                            }),
                                            i
                                        );
                                    });
                            }),
                            (A.prototype.create = function (e) {
                                return this.createCollection(e);
                            }),
                            (A.prototype.createCollection = function (e) {
                                e = new f(this, e);
                                return this.bindCollection(e), this.collections.push(e), e;
                            }),
                            (A.prototype.bindCollection = function (e) {
                                function t(e, t) {
                                    (i = e.type + " " + t.id + ":" + e.type), n.trigger(i, t);
                                }
                                var i,
                                    n = this;
                                e.on("destroyed", n.onDestroyed.bind(n)), e.on("shown hidden rested dir plain", t), e.on("dir:up dir:right dir:down dir:left", t), e.on("plain:up plain:right plain:down plain:left", t);
                            }),
                            (A.prototype.bindDocument = function () {
                                this.binded || (this.bindEvt(document, "move").bindEvt(document, "end"), (this.binded = !0));
                            }),
                            (A.prototype.unbindDocument = function (e) {
                                (Object.keys(this.ids).length && !0 !== e) || (this.unbindEvt(document, "move").unbindEvt(document, "end"), (this.binded = !1));
                            }),
                            (A.prototype.getIdentifier = function (e) {
                                var t;
                                return (
                                    e ? void 0 === (t = void 0 === e.identifier ? e.pointerId : e.identifier) && (t = this.latest || 0) : (t = this.index),
                                    void 0 === this.ids[t] && ((this.ids[t] = this.index), (this.index += 1)),
                                    (this.latest = t),
                                    this.ids[t]
                                );
                            }),
                            (A.prototype.removeIdentifier = function (e) {
                                var t,
                                    i = {};
                                for (t in this.ids)
                                    if (this.ids[t] === e) {
                                        (i.id = t), (i.identifier = this.ids[t]), delete this.ids[t];
                                        break;
                                    }
                                return i;
                            }),
                            (A.prototype.onmove = function (e) {
                                return this.onAny("move", e), !1;
                            }),
                            (A.prototype.onend = function (e) {
                                return this.onAny("end", e), !1;
                            }),
                            (A.prototype.oncancel = function (e) {
                                return this.onAny("end", e), !1;
                            }),
                            (A.prototype.onAny = function (e, t) {
                                var i,
                                    n = this,
                                    s = "processOn" + e.charAt(0).toUpperCase() + e.slice(1);
                                t = l(t);
                                return (
                                    h(t, function (e) {
                                        (i = n.getIdentifier(e)),
                                            h(
                                                n.collections,
                                                function (e, t, i) {
                                                    0 <= i.ids.indexOf(t) && (i[s](e), (e._found_ = !0));
                                                }.bind(null, e, i)
                                            ),
                                            e._found_ || n.removeIdentifier(i);
                                    }),
                                    !1
                                );
                            }),
                            (A.prototype.destroy = function () {
                                this.unbindDocument(!0),
                                    (this.ids = {}),
                                    (this.index = 0),
                                    this.collections.forEach(function (e) {
                                        e.destroy();
                                    }),
                                    this.off();
                            }),
                            (A.prototype.onDestroyed = function (e, t) {
                                if (this.collections.indexOf(t) < 0) return !1;
                                this.collections.splice(this.collections.indexOf(t), 1);
                            });
                        var v = new A();
                        t.default = {
                            create: function (e) {
                                return v.create(e);
                            },
                            factory: v,
                        };
                    },
                ]),
                (n = {}),
                (s.m = i),
                (s.c = n),
                (s.d = function (e, t, i) {
                    s.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: i });
                }),
                (s.r = function (e) {
                    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 });
                }),
                (s.t = function (t, e) {
                    if ((1 & e && (t = s(t)), 8 & e)) return t;
                    if (4 & e && "object" == typeof t && t && t.__esModule) return t;
                    var i = Object.create(null);
                    if ((s.r(i), Object.defineProperty(i, "default", { enumerable: !0, value: t }), 2 & e && "string" != typeof t))
                        for (var n in t)
                            s.d(
                                i,
                                n,
                                function (e) {
                                    return t[e];
                                }.bind(null, n)
                            );
                    return i;
                }),
                (s.n = function (e) {
                    var t =
                        e && e.__esModule
                            ? function () {
                                  return e.default;
                              }
                            : function () {
                                  return e;
                              };
                    return s.d(t, "a", t), t;
                }),
                (s.o = function (e, t) {
                    return Object.prototype.hasOwnProperty.call(e, t);
                }),
                (s.p = ""),
                s((s.s = 0)).default
            );
            function s(e) {
                var t;
                return (n[e] || ((t = n[e] = { i: e, l: !1, exports: {} }), i[e].call(t.exports, t, t.exports, s), (t.l = !0), t)).exports;
            }
            var i, n;
        }),
        "object" == typeof exports && "object" == typeof module ? (module.exports = i()) : "function" == typeof define && define.amd ? define("nipplejs", [], i) : "object" == typeof exports ? (exports.nipplejs = i()) : (t.nipplejs = i()),
        (window.EJS_SHADERS = {
            "2xScaleHQ.glslp": {
                shader: { type: "text", value: 'shaders = 1\n\nshader0 = "2xScaleHQ.glsl"\nfilter_linear0 = false\nscale_type_0 = source\n' },
                resources: [
                    {
                        name: "2xScaleHQ.glsl",
                        type: "base64",
                        value:
                            "LyoKICAgMnhHTFNMSHFGaWx0ZXIgc2hhZGVyCiAgIAogICBDb3B5cmlnaHQgKEMpIDIwMDUgZ3Vlc3QocikgLSBndWVzdC5yQGdtYWlsLmNvbQoKICAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vcgogICBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZQogICBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMgogICBvZiB0aGUgTGljZW5zZSwgb3IgKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi4KCiAgIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLAogICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZgogICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlCiAgIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuCgogICBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZQogICBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbTsgaWYgbm90LCB3cml0ZSB0byB0aGUgRnJlZSBTb2Z0d2FyZQogICBGb3VuZGF0aW9uLCBJbmMuLCA1OSBUZW1wbGUgUGxhY2UgLSBTdWl0ZSAzMzAsIEJvc3RvbiwgTUEgIDAyMTExLTEzMDcsIFVTQS4KKi8KCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBvdXQKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcgCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IENPTE9SOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7CkNPTVBBVF9WQVJZSU5HIHZlYzQgQ09MMDsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQxOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQyOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQzOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ0OwoKdmVjNCBfb1Bvc2l0aW9uMTsgCnVuaWZvcm0gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKCi8vIGNvbXBhdGliaWxpdHkgI2RlZmluZXMKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQojZGVmaW5lIFNvdXJjZVNpemUgdmVjNChUZXh0dXJlU2l6ZSwgMS4wIC8gVGV4dHVyZVNpemUpIC8vZWl0aGVyIFRleHR1cmVTaXplIG9yIElucHV0U2l6ZQojZGVmaW5lIE91dFNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQoKdm9pZCBtYWluKCkKewogICAgZ2xfUG9zaXRpb24gPSBNVlBNYXRyaXggKiBWZXJ0ZXhDb29yZDsKICAgIFRFWDAueHkgPSBUZXhDb29yZC54eTsKICAgZmxvYXQgeCA9IDAuNSAqIFNvdXJjZVNpemUuejsKICAgZmxvYXQgeSA9IDAuNSAqIFNvdXJjZVNpemUudzsKICAgdmVjMiBkZzEgPSB2ZWMyKCB4LCB5KTsKICAgdmVjMiBkZzIgPSB2ZWMyKC14LCB5KTsKICAgdmVjMiBkeCA9IHZlYzIoeCwgMC4wKTsKICAgdmVjMiBkeSA9IHZlYzIoMC4wLCB5KTsKICAgdDEgPSB2ZWM0KHZUZXhDb29yZCAtIGRnMSwgdlRleENvb3JkIC0gZHkpOwogICB0MiA9IHZlYzQodlRleENvb3JkIC0gZGcyLCB2VGV4Q29vcmQgKyBkeCk7CiAgIHQzID0gdmVjNCh2VGV4Q29vcmQgKyBkZzEsIHZUZXhDb29yZCArIGR5KTsKICAgdDQgPSB2ZWM0KHZUZXhDb29yZCArIGRnMiwgdlRleENvb3JkIC0gZHgpOwp9CgojZWxpZiBkZWZpbmVkKEZSQUdNRU5UKQoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQpvdXQgdmVjNCBGcmFnQ29sb3I7CiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZwojZGVmaW5lIEZyYWdDb2xvciBnbF9GcmFnQ29sb3IKI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdICnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2Vsc2UKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CiNlbmRpZgojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7CnVuaWZvcm0gc2FtcGxlcjJEIFRleHR1cmU7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKQ09NUEFUX1ZBUllJTkcgdmVjNCB0MTsKQ09NUEFUX1ZBUllJTkcgdmVjNCB0MjsKQ09NUEFUX1ZBUllJTkcgdmVjNCB0MzsKQ09NUEFUX1ZBUllJTkcgdmVjNCB0NDsKCi8vIGNvbXBhdGliaWxpdHkgI2RlZmluZXMKI2RlZmluZSBTb3VyY2UgVGV4dHVyZQojZGVmaW5lIHZUZXhDb29yZCBURVgwLnh5CgojZGVmaW5lIFNvdXJjZVNpemUgdmVjNChUZXh0dXJlU2l6ZSwgMS4wIC8gVGV4dHVyZVNpemUpIC8vZWl0aGVyIFRleHR1cmVTaXplIG9yIElucHV0U2l6ZQojZGVmaW5lIE91dFNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQoKZmxvYXQgbXggPSAwLjMyNTsgICAgICAvLyBzdGFydCBzbW9vdGhpbmcgd3QuCmZsb2F0IGsgPSAtMC4yNTA7ICAgICAgLy8gd3QuIGRlY3JlYXNlIGZhY3RvcgpmbG9hdCBtYXhfdyA9IDAuMjU7ICAgIC8vIG1heCBmaWx0ZXIgd2VpZ2h0CmZsb2F0IG1pbl93ID0tMC4wNTsgICAgLy8gbWluIGZpbHRlciB3ZWlnaHQKZmxvYXQgbHVtX2FkZCA9IDAuMjU7ICAvLyBhZmZlY3RzIHNtb290aGluZwp2ZWMzIGR0ID0gdmVjMygxLjApOwoKdm9pZCBtYWluKCkKewogICB2ZWMzIGMwMCA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgdDEueHkpLnh5ejsgCiAgIHZlYzMgYzEwID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0MS56dykueHl6OyAKICAgdmVjMyBjMjAgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHQyLnh5KS54eXo7IAogICB2ZWMzIGMwMSA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgdDQuencpLnh5ejsgCiAgIHZlYzMgYzExID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB2VGV4Q29vcmQpLnh5ejsgCiAgIHZlYzMgYzIxID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0Mi56dykueHl6OyAKICAgdmVjMyBjMDIgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHQ0Lnh5KS54eXo7IAogICB2ZWMzIGMxMiA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgdDMuencpLnh5ejsgCiAgIHZlYzMgYzIyID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0My54eSkueHl6OyAKCiAgIGZsb2F0IG1kMSA9IGRvdChhYnMoYzAwIC0gYzIyKSwgZHQpOwogICBmbG9hdCBtZDIgPSBkb3QoYWJzKGMwMiAtIGMyMCksIGR0KTsKCiAgIGZsb2F0IHcxID0gZG90KGFicyhjMjIgLSBjMTEpLCBkdCkgKiBtZDI7CiAgIGZsb2F0IHcyID0gZG90KGFicyhjMDIgLSBjMTEpLCBkdCkgKiBtZDE7CiAgIGZsb2F0IHczID0gZG90KGFicyhjMDAgLSBjMTEpLCBkdCkgKiBtZDI7CiAgIGZsb2F0IHc0ID0gZG90KGFicyhjMjAgLSBjMTEpLCBkdCkgKiBtZDE7CgogICBmbG9hdCB0MSA9IHcxICsgdzM7CiAgIGZsb2F0IHQyID0gdzIgKyB3NDsKICAgZmxvYXQgd3cgPSBtYXgodDEsIHQyKSArIDAuMDAwMTsKCiAgIGMxMSA9ICh3MSAqIGMwMCArIHcyICogYzIwICsgdzMgKiBjMjIgKyB3NCAqIGMwMiArIHd3ICogYzExKSAvICh0MSArIHQyICsgd3cpOwoKICAgZmxvYXQgbGMxID0gayAvICgwLjEyICogZG90KGMxMCArIGMxMiArIGMxMSwgZHQpICsgbHVtX2FkZCk7CiAgIGZsb2F0IGxjMiA9IGsgLyAoMC4xMiAqIGRvdChjMDEgKyBjMjEgKyBjMTEsIGR0KSArIGx1bV9hZGQpOwoKICAgdzEgPSBjbGFtcChsYzEgKiBkb3QoYWJzKGMxMSAtIGMxMCksIGR0KSArIG14LCBtaW5fdywgbWF4X3cpOwogICB3MiA9IGNsYW1wKGxjMiAqIGRvdChhYnMoYzExIC0gYzIxKSwgZHQpICsgbXgsIG1pbl93LCBtYXhfdyk7CiAgIHczID0gY2xhbXAobGMxICogZG90KGFicyhjMTEgLSBjMTIpLCBkdCkgKyBteCwgbWluX3csIG1heF93KTsKICAgdzQgPSBjbGFtcChsYzIgKiBkb3QoYWJzKGMxMSAtIGMwMSksIGR0KSArIG14LCBtaW5fdywgbWF4X3cpOwogICBGcmFnQ29sb3IgPSB2ZWM0KHcxICogYzEwICsgdzIgKiBjMjEgKyB3MyAqIGMxMiArIHc0ICogYzAxICsgKDEuMCAtIHcxIC0gdzIgLSB3MyAtIHc0KSAqIGMxMSwgMS4wKTsKfSAKI2VuZGlmCg==",
                    },
                ],
            },
            "4xScaleHQ.glslp": {
                shader: { type: "text", value: 'shaders = 1\n\nshader0 = "4xScaleHQ.glsl"\nfilter_linear0 = false\nscale_type_0 = source\n' },
                resources: [
                    {
                        name: "4xScaleHQ.glsl",
                        type: "base64",
                        value:
                            "LyoKICAgNHhHTFNMSHFGaWx0ZXIgc2hhZGVyCiAgIAogICBDb3B5cmlnaHQgKEMpIDIwMDUgZ3Vlc3QocikgLSBndWVzdC5yQGdtYWlsLmNvbQoKICAgVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vcgogICBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZQogICBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMgogICBvZiB0aGUgTGljZW5zZSwgb3IgKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi4KCiAgIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLAogICBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZgogICBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlCiAgIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuCgogICBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZQogICBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbTsgaWYgbm90LCB3cml0ZSB0byB0aGUgRnJlZSBTb2Z0d2FyZQogICBGb3VuZGF0aW9uLCBJbmMuLCA1OSBUZW1wbGUgUGxhY2UgLSBTdWl0ZSAzMzAsIEJvc3RvbiwgTUEgIDAyMTExLTEzMDcsIFVTQS4KKi8KCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBvdXQKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcgCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IENPTE9SOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7CkNPTVBBVF9WQVJZSU5HIHZlYzQgQ09MMDsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQxOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQyOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQzOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ0OwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ1OwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ2OwoKdmVjNCBfb1Bvc2l0aW9uMTsgCnVuaWZvcm0gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKCi8vIGNvbXBhdGliaWxpdHkgI2RlZmluZXMKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQojZGVmaW5lIFNvdXJjZVNpemUgdmVjNChUZXh0dXJlU2l6ZSwgMS4wIC8gVGV4dHVyZVNpemUpIC8vZWl0aGVyIFRleHR1cmVTaXplIG9yIElucHV0U2l6ZQojZGVmaW5lIE91dFNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQoKdm9pZCBtYWluKCkKewogICAgZ2xfUG9zaXRpb24gPSBNVlBNYXRyaXggKiBWZXJ0ZXhDb29yZDsKICAgIFRFWDAueHkgPSBUZXhDb29yZC54eTsKICAgZmxvYXQgeCA9IDAuNSAqIFNvdXJjZVNpemUuejsKICAgZmxvYXQgeSA9IDAuNSAqIFNvdXJjZVNpemUudzsKICAgdmVjMiBkZzEgPSB2ZWMyKCB4LCB5KTsKICAgdmVjMiBkZzIgPSB2ZWMyKC14LCB5KTsKICAgdmVjMiBzZDEgPSBkZzEgKiAwLjU7CiAgIHZlYzIgc2QyID0gZGcyICogMC41OwogICB2ZWMyIGRkeCA9IHZlYzIoeCwgMC4wKTsKICAgdmVjMiBkZHkgPSB2ZWMyKDAuMCwgeSk7CiAgIHQxID0gdmVjNCh2VGV4Q29vcmQgLSBzZDEsIHZUZXhDb29yZCAtIGRkeSk7CiAgIHQyID0gdmVjNCh2VGV4Q29vcmQgLSBzZDIsIHZUZXhDb29yZCArIGRkeCk7CiAgIHQzID0gdmVjNCh2VGV4Q29vcmQgKyBzZDEsIHZUZXhDb29yZCArIGRkeSk7CiAgIHQ0ID0gdmVjNCh2VGV4Q29vcmQgKyBzZDIsIHZUZXhDb29yZCAtIGRkeCk7CiAgIHQ1ID0gdmVjNCh2VGV4Q29vcmQgLSBkZzEsIHZUZXhDb29yZCAtIGRnMik7CiAgIHQ2ID0gdmVjNCh2VGV4Q29vcmQgKyBkZzEsIHZUZXhDb29yZCArIGRnMik7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojaWZkZWYgR0xfRlJBR01FTlRfUFJFQ0lTSU9OX0hJR0gKcHJlY2lzaW9uIGhpZ2hwIGZsb2F0OwojZWxzZQpwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsKI2VuZGlmCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQxOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQyOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQzOwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ0OwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ1OwpDT01QQVRfVkFSWUlORyB2ZWM0IHQ2OwoKLy8gY29tcGF0aWJpbGl0eSAjZGVmaW5lcwojZGVmaW5lIFNvdXJjZSBUZXh0dXJlCiNkZWZpbmUgdlRleENvb3JkIFRFWDAueHkKCiNkZWZpbmUgU291cmNlU2l6ZSB2ZWM0KFRleHR1cmVTaXplLCAxLjAgLyBUZXh0dXJlU2l6ZSkgLy9laXRoZXIgVGV4dHVyZVNpemUgb3IgSW5wdXRTaXplCiNkZWZpbmUgT3V0U2l6ZSB2ZWM0KE91dHB1dFNpemUsIDEuMCAvIE91dHB1dFNpemUpCgpmbG9hdCBteCA9IDEuMDsgICAgICAvLyBzdGFydCBzbW9vdGhpbmcgd3QuCmZsb2F0IGsgPSAtMS4xMDsgICAgICAvLyB3dC4gZGVjcmVhc2UgZmFjdG9yCmZsb2F0IG1heF93ID0gMC43NTsgICAgLy8gbWF4IGZpbHRlciB3ZWlnaHQKZmxvYXQgbWluX3cgPSAwLjAzOyAgICAvLyBtaW4gZmlsdGVyIHdlaWdodApmbG9hdCBsdW1fYWRkID0gMC4zMzsgIC8vIGFmZmVjdHMgc21vb3RoaW5nCnZlYzMgZHQgPSB2ZWMzKDEuMCk7Cgp2b2lkIG1haW4oKQp7CiAgIHZlYzMgYyAgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHZUZXhDb29yZCkueHl6OwogICB2ZWMzIGkxID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0MS54eSkueHl6OyAKICAgdmVjMyBpMiA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgdDIueHkpLnh5ejsgCiAgIHZlYzMgaTMgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHQzLnh5KS54eXo7IAogICB2ZWMzIGk0ID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0NC54eSkueHl6OyAKICAgdmVjMyBvMSA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgdDUueHkpLnh5ejsgCiAgIHZlYzMgbzMgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHQ2Lnh5KS54eXo7IAogICB2ZWMzIG8yID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0NS56dykueHl6OwogICB2ZWMzIG80ID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0Ni56dykueHl6OwogICB2ZWMzIHMxID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0MS56dykueHl6OyAKICAgdmVjMyBzMiA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgdDIuencpLnh5ejsgCiAgIHZlYzMgczMgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHQzLnp3KS54eXo7IAogICB2ZWMzIHM0ID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB0NC56dykueHl6OyAKCiAgIGZsb2F0IGtvMT1kb3QoYWJzKG8xLWMpLGR0KTsKICAgZmxvYXQga28yPWRvdChhYnMobzItYyksZHQpOwogICBmbG9hdCBrbzM9ZG90KGFicyhvMy1jKSxkdCk7CiAgIGZsb2F0IGtvND1kb3QoYWJzKG80LWMpLGR0KTsKCiAgIGZsb2F0IGsxPW1pbihkb3QoYWJzKGkxLWkzKSxkdCksbWF4KGtvMSxrbzMpKTsKICAgZmxvYXQgazI9bWluKGRvdChhYnMoaTItaTQpLGR0KSxtYXgoa28yLGtvNCkpOwoKICAgZmxvYXQgdzEgPSBrMjsgaWYoa28zPGtvMSkgdzEqPWtvMy9rbzE7CiAgIGZsb2F0IHcyID0gazE7IGlmKGtvNDxrbzIpIHcyKj1rbzQva28yOwogICBmbG9hdCB3MyA9IGsyOyBpZihrbzE8a28zKSB3Myo9a28xL2tvMzsKICAgZmxvYXQgdzQgPSBrMTsgaWYoa28yPGtvNCkgdzQqPWtvMi9rbzQ7CgogICBjPSh3MSpvMSt3MipvMit3MypvMyt3NCpvNCswLjAwMSpjKS8odzErdzIrdzMrdzQrMC4wMDEpOwogICB3MSA9IGsqZG90KGFicyhpMS1jKSthYnMoaTMtYyksZHQpLygwLjEyNSpkb3QoaTEraTMsZHQpK2x1bV9hZGQpOwogICB3MiA9IGsqZG90KGFicyhpMi1jKSthYnMoaTQtYyksZHQpLygwLjEyNSpkb3QoaTIraTQsZHQpK2x1bV9hZGQpOwogICB3MyA9IGsqZG90KGFicyhzMS1jKSthYnMoczMtYyksZHQpLygwLjEyNSpkb3QoczErczMsZHQpK2x1bV9hZGQpOwogICB3NCA9IGsqZG90KGFicyhzMi1jKSthYnMoczQtYyksZHQpLygwLjEyNSpkb3QoczIrczQsZHQpK2x1bV9hZGQpOwoKICAgdzEgPSBjbGFtcCh3MStteCxtaW5fdyxtYXhfdyk7IAogICB3MiA9IGNsYW1wKHcyK214LG1pbl93LG1heF93KTsKICAgdzMgPSBjbGFtcCh3MytteCxtaW5fdyxtYXhfdyk7IAogICB3NCA9IGNsYW1wKHc0K214LG1pbl93LG1heF93KTsKCiAgIEZyYWdDb2xvciA9IHZlYzQoKHcxKihpMStpMykrdzIqKGkyK2k0KSt3MyooczErczMpK3c0KihzMitzNCkrYykvKDIuMCoodzErdzIrdzMrdzQpKzEuMCksIDEuMCk7Cn0gCiNlbmRpZgo=",
                    },
                ],
            },
            sabr: {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = sabr-v3.0.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "sabr-v3.0.glsl",
                        type: "base64",
                        value:
                            "LyoKCVNBQlIgdjMuMCBTaGFkZXIKCUpvc2h1YSBTdHJlZXQKCQoJUG9ydGlvbnMgb2YgdGhpcyBhbGdvcml0aG0gd2VyZSB0YWtlbiBmcm9tIEh5bGxpYW4ncyA1eEJSIHYzLjdjCglzaGFkZXIuCgkKCVRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IKCW1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlCglhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMgoJb2YgdGhlIExpY2Vuc2UsIG9yIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uCgoJVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsCglidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZgoJTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZQoJR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4KCglZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZQoJYWxvbmcgd2l0aCB0aGlzIHByb2dyYW07IGlmIG5vdCwgd3JpdGUgdG8gdGhlIEZyZWUgU29mdHdhcmUKCUZvdW5kYXRpb24sIEluYy4sIDU5IFRlbXBsZSBQbGFjZSAtIFN1aXRlIDMzMCwgQm9zdG9uLCBNQSAgMDIxMTEtMTMwNywgVVNBLgoKKi8KCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBvdXQKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcgCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IENPTE9SOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7CkNPTVBBVF9WQVJZSU5HIHZlYzQgQ09MMDsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwoKdW5pZm9ybSBtYXQ0IE1WUE1hdHJpeDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwpDT01QQVRfVkFSWUlORyB2ZWMyIHRjOwpDT01QQVRfVkFSWUlORyB2ZWM0IHh5cF8xXzJfMzsKQ09NUEFUX1ZBUllJTkcgdmVjNCB4eXBfNV8xMF8xNTsKQ09NUEFUX1ZBUllJTkcgdmVjNCB4eXBfNl83Xzg7CkNPTVBBVF9WQVJZSU5HIHZlYzQgeHlwXzlfMTRfOTsKQ09NUEFUX1ZBUllJTkcgdmVjNCB4eXBfMTFfMTJfMTM7CkNPTVBBVF9WQVJZSU5HIHZlYzQgeHlwXzE2XzE3XzE4OwpDT01QQVRfVkFSWUlORyB2ZWM0IHh5cF8yMV8yMl8yMzsKCi8vIHZlcnRleCBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgdlRleENvb3JkIFRFWDAueHkKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBvdXRzaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCnZvaWQgbWFpbigpCnsKICAgIGdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7CiAgICBDT0wwID0gQ09MT1I7CiAgICBURVgwLnh5ID0gVGV4Q29vcmQueHk7CiAgIAlmbG9hdCB4ID0gU291cmNlU2l6ZS56Oy8vMS4wIC8gSU4udGV4dHVyZV9zaXplLng7CglmbG9hdCB5ID0gU291cmNlU2l6ZS53Oy8vMS4wIC8gSU4udGV4dHVyZV9zaXplLnk7CgkKCXRjID0gVEVYMC54eSAqIHZlYzIoMS4wMDA0LCAxLjApOwoJeHlwXzFfMl8zICAgID0gdGMueHh4eSArIHZlYzQoICAgICAgLXgsIDAuMCwgICB4LCAtMi4wICogeSk7Cgl4eXBfNl83XzggICAgPSB0Yy54eHh5ICsgdmVjNCggICAgICAteCwgMC4wLCAgIHgsICAgICAgIC15KTsKCXh5cF8xMV8xMl8xMyA9IHRjLnh4eHkgKyB2ZWM0KCAgICAgIC14LCAwLjAsICAgeCwgICAgICAwLjApOwoJeHlwXzE2XzE3XzE4ID0gdGMueHh4eSArIHZlYzQoICAgICAgLXgsIDAuMCwgICB4LCAgICAgICAgeSk7Cgl4eXBfMjFfMjJfMjMgPSB0Yy54eHh5ICsgdmVjNCggICAgICAteCwgMC4wLCAgIHgsICAyLjAgKiB5KTsKCXh5cF81XzEwXzE1ICA9IHRjLnh5eXkgKyB2ZWM0KC0yLjAgKiB4LCAgLXksIDAuMCwgICAgICAgIHkpOwoJeHlwXzlfMTRfOSAgID0gdGMueHl5eSArIHZlYzQoIDIuMCAqIHgsICAteSwgMC4wLCAgICAgICAgeSk7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojaWZkZWYgR0xfRlJBR01FTlRfUFJFQ0lTSU9OX0hJR0gKcHJlY2lzaW9uIGhpZ2hwIGZsb2F0OwojZWxzZQpwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsKI2VuZGlmCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwpDT01QQVRfVkFSWUlORyB2ZWMyIHRjOwpDT01QQVRfVkFSWUlORyB2ZWM0IHh5cF8xXzJfMzsKQ09NUEFUX1ZBUllJTkcgdmVjNCB4eXBfNV8xMF8xNTsKQ09NUEFUX1ZBUllJTkcgdmVjNCB4eXBfNl83Xzg7CkNPTVBBVF9WQVJZSU5HIHZlYzQgeHlwXzlfMTRfOTsKQ09NUEFUX1ZBUllJTkcgdmVjNCB4eXBfMTFfMTJfMTM7CkNPTVBBVF9WQVJZSU5HIHZlYzQgeHlwXzE2XzE3XzE4OwpDT01QQVRfVkFSWUlORyB2ZWM0IHh5cF8yMV8yMl8yMzsKCi8vIGZyYWdtZW50IGNvbXBhdGliaWxpdHkgI2RlZmluZXMKI2RlZmluZSBTb3VyY2UgVGV4dHVyZQojZGVmaW5lIHZUZXhDb29yZCBURVgwLnh5CgojZGVmaW5lIFNvdXJjZVNpemUgdmVjNChUZXh0dXJlU2l6ZSwgMS4wIC8gVGV4dHVyZVNpemUpIC8vZWl0aGVyIFRleHR1cmVTaXplIG9yIElucHV0U2l6ZQojZGVmaW5lIG91dHNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQoKLyoKCUNvbnN0YW50cwoqLwovKgoJSW5lcXVhdGlvbiBjb2VmZmljaWVudHMgZm9yIGludGVycG9sYXRpb24KRXF1YXRpb25zIGFyZSBpbiB0aGUgZm9ybTogQXkgKyBCeCA9IEMKNDUsIDMwLCBhbmQgNjAgZGVub3RlIHRoZSBhbmdsZSBmcm9tIHggZWFjaCBsaW5lIHRoZSBjb29lZmljaWVudCB2YXJpYWJsZSBzZXQgYnVpbGRzCiovCmNvbnN0IHZlYzQgQWkgID0gdmVjNCggMS4wLCAtMS4wLCAtMS4wLCAgMS4wKTsKY29uc3QgdmVjNCBCNDUgPSB2ZWM0KCAxLjAsICAxLjAsIC0xLjAsIC0xLjApOwpjb25zdCB2ZWM0IEM0NSA9IHZlYzQoIDEuNSwgIDAuNSwgLTAuNSwgIDAuNSk7CmNvbnN0IHZlYzQgQjMwID0gdmVjNCggMC41LCAgMi4wLCAtMC41LCAtMi4wKTsKY29uc3QgdmVjNCBDMzAgPSB2ZWM0KCAxLjAsICAxLjAsIC0wLjUsICAwLjApOwpjb25zdCB2ZWM0IEI2MCA9IHZlYzQoIDIuMCwgIDAuNSwgLTIuMCwgLTAuNSk7CmNvbnN0IHZlYzQgQzYwID0gdmVjNCggMi4wLCAgMC4wLCAtMS4wLCAgMC41KTsKCmNvbnN0IHZlYzQgTTQ1ID0gdmVjNCgwLjQsIDAuNCwgMC40LCAwLjQpOwpjb25zdCB2ZWM0IE0zMCA9IHZlYzQoMC4yLCAwLjQsIDAuMiwgMC40KTsKY29uc3QgdmVjNCBNNjAgPSBNMzAueXh3ejsKY29uc3QgdmVjNCBNc2hpZnQgPSB2ZWM0KDAuMik7CgovLyBDb2VmZmljaWVudCBmb3Igd2VpZ2h0ZWQgZWRnZSBkZXRlY3Rpb24KY29uc3QgZmxvYXQgY29lZiA9IDIuMDsKLy8gVGhyZXNob2xkIGZvciBpZiBsdW1pbmFuY2UgdmFsdWVzIGFyZSAiZXF1YWwiCmNvbnN0IHZlYzQgdGhyZXNob2xkID0gdmVjNCgwLjMyKTsKCi8vIENvbnZlcnNpb24gZnJvbSBSR0IgdG8gTHVtaW5hbmNlIChmcm9tIEdJTVApCmNvbnN0IHZlYzMgbHVtID0gdmVjMygwLjIxLCAwLjcyLCAwLjA3KTsKCi8vIFBlcmZvcm1zIHNhbWUgbG9naWMgb3BlcmF0aW9uIGFzICYmIGZvciB2ZWN0b3JzCmJ2ZWM0IF9hbmRfKGJ2ZWM0IEEsIGJ2ZWM0IEIpIHsKCXJldHVybiBidmVjNChBLnggJiYgQi54LCBBLnkgJiYgQi55LCBBLnogJiYgQi56LCBBLncgJiYgQi53KTsKfQoKLy8gUGVyZm9ybXMgc2FtZSBsb2dpYyBvcGVyYXRpb24gYXMgfHwgZm9yIHZlY3RvcnMKYnZlYzQgX29yXyhidmVjNCBBLCBidmVjNCBCKSB7CglyZXR1cm4gYnZlYzQoQS54IHx8IEIueCwgQS55IHx8IEIueSwgQS56IHx8IEIueiwgQS53IHx8IEIudyk7Cn0KCi8vIENvbnZlcnRzIDQgMy1jb2xvciB2ZWN0b3JzIGludG8gMSA0LXZhbHVlIGx1bWluYW5jZSB2ZWN0b3IKdmVjNCBsdW1fdG8odmVjMyB2MCwgdmVjMyB2MSwgdmVjMyB2MiwgdmVjMyB2MykgewoJcmV0dXJuIHZlYzQoZG90KGx1bSwgdjApLCBkb3QobHVtLCB2MSksIGRvdChsdW0sIHYyKSwgZG90KGx1bSwgdjMpKTsKfQoKLy8gR2V0cyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIDIgNC12YWx1ZSBsdW1pbmFuY2UgdmVjdG9ycwp2ZWM0IGx1bV9kZih2ZWM0IEEsIHZlYzQgQikgewoJcmV0dXJuIGFicyhBIC0gQik7Cn0KCi8vIERldGVybWluZXMgaWYgMiA0LXZhbHVlIGx1bWluYW5jZSB2ZWN0b3JzIGFyZSAiZXF1YWwiIGJhc2VkIG9uIHRocmVzaG9sZApidmVjNCBsdW1fZXEodmVjNCBBLCB2ZWM0IEIpIHsKCXJldHVybiBsZXNzVGhhbihsdW1fZGYoQSwgQiksIHRocmVzaG9sZCk7Cn0KCnZlYzQgbHVtX3dkKHZlYzQgYSwgdmVjNCBiLCB2ZWM0IGMsIHZlYzQgZCwgdmVjNCBlLCB2ZWM0IGYsIHZlYzQgZywgdmVjNCBoKSB7CglyZXR1cm4gbHVtX2RmKGEsIGIpICsgbHVtX2RmKGEsIGMpICsgbHVtX2RmKGQsIGUpICsgbHVtX2RmKGQsIGYpICsgNC4wICogbHVtX2RmKGcsIGgpOwp9CgovLyBHZXRzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gMiAzLXZhbHVlIHJnYiBjb2xvcnMKZmxvYXQgY19kZih2ZWMzIGMxLCB2ZWMzIGMyKSB7Cgl2ZWMzIGRmID0gYWJzKGMxIC0gYzIpOwoJcmV0dXJuIGRmLnIgKyBkZi5nICsgZGYuYjsKfQoKdm9pZCBtYWluKCkKewovKgpNYXNrIGZvciBhbGdvcml0aG0KKy0tLS0tKy0tLS0tKy0tLS0tKy0tLS0tKy0tLS0tKwp8ICAgICB8ICAxICB8ICAyICB8ICAzICB8ICAgICB8CistLS0tLSstLS0tLSstLS0tLSstLS0tLSstLS0tLSsKfCAgNSAgfCAgNiAgfCAgNyAgfCAgOCAgfCAgOSAgfAorLS0tLS0rLS0tLS0rLS0tLS0rLS0tLS0rLS0tLS0rCnwgMTAgIHwgMTEgIHwgMTIgIHwgMTMgIHwgMTQgIHwKKy0tLS0tKy0tLS0tKy0tLS0tKy0tLS0tKy0tLS0tKwp8IDE1ICB8IDE2ICB8IDE3ICB8IDE4ICB8IDE5ICB8CistLS0tLSstLS0tLSstLS0tLSstLS0tLSstLS0tLSsKfCAgICAgfCAyMSAgfCAyMiAgfCAyMyAgfCAgICAgfAorLS0tLS0rLS0tLS0rLS0tLS0rLS0tLS0rLS0tLS0rCgkqLwoJLy8gR2V0IG1hc2sgdmFsdWVzIGJ5IHBlcmZvcm1pbmcgdGV4dHVyZSBsb29rdXAgd2l0aCB0aGUgdW5pZm9ybSBzYW1wbGVyCgl2ZWMzIFAxICA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzFfMl8zLnh3ICAgKS5yZ2I7Cgl2ZWMzIFAyICA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzFfMl8zLnl3ICAgKS5yZ2I7Cgl2ZWMzIFAzICA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzFfMl8zLnp3ICAgKS5yZ2I7CgkKCXZlYzMgUDYgID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB4eXBfNl83XzgueHcgICApLnJnYjsKCXZlYzMgUDcgID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB4eXBfNl83XzgueXcgICApLnJnYjsKCXZlYzMgUDggID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB4eXBfNl83XzguencgICApLnJnYjsKCQoJdmVjMyBQMTEgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHh5cF8xMV8xMl8xMy54dykucmdiOwoJdmVjMyBQMTIgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHh5cF8xMV8xMl8xMy55dykucmdiOwoJdmVjMyBQMTMgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHh5cF8xMV8xMl8xMy56dykucmdiOwoJCgl2ZWMzIFAxNiA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzE2XzE3XzE4Lnh3KS5yZ2I7Cgl2ZWMzIFAxNyA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzE2XzE3XzE4Lnl3KS5yZ2I7Cgl2ZWMzIFAxOCA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzE2XzE3XzE4Lnp3KS5yZ2I7CgkKCXZlYzMgUDIxID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB4eXBfMjFfMjJfMjMueHcpLnJnYjsKCXZlYzMgUDIyID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB4eXBfMjFfMjJfMjMueXcpLnJnYjsKCXZlYzMgUDIzID0gQ09NUEFUX1RFWFRVUkUoU291cmNlLCB4eXBfMjFfMjJfMjMuencpLnJnYjsKCQoJdmVjMyBQNSAgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHh5cF81XzEwXzE1Lnh5ICkucmdiOwoJdmVjMyBQMTAgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHh5cF81XzEwXzE1Lnh6ICkucmdiOwoJdmVjMyBQMTUgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHh5cF81XzEwXzE1Lnh3ICkucmdiOwoJCgl2ZWMzIFA5ICA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzlfMTRfOS54eSAgKS5yZ2I7Cgl2ZWMzIFAxNCA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzlfMTRfOS54eiAgKS5yZ2I7Cgl2ZWMzIFAxOSA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgeHlwXzlfMTRfOS54dyAgKS5yZ2I7CgkKCS8vIFN0b3JlIGx1bWluYW5jZSB2YWx1ZXMgb2YgZWFjaCBwb2ludCBpbiBncm91cHMgb2YgNAoJLy8gc28gdGhhdCB3ZSBtYXkgb3BlcmF0ZSBvbiBhbGwgZm91ciBjb3JuZXJzIGF0IG9uY2UKCXZlYzQgcDcgID0gbHVtX3RvKFA3LCAgUDExLCBQMTcsIFAxMyk7Cgl2ZWM0IHA4ICA9IGx1bV90byhQOCwgIFA2LCAgUDE2LCBQMTgpOwoJdmVjNCBwMTEgPSBwNy55end4OyAgICAgICAgICAgICAgICAgICAgICAvLyBQMTEsIFAxNywgUDEzLCBQNwoJdmVjNCBwMTIgPSBsdW1fdG8oUDEyLCBQMTIsIFAxMiwgUDEyKTsKCXZlYzQgcDEzID0gcDcud3h5ejsgICAgICAgICAgICAgICAgICAgICAgLy8gUDEzLCBQNywgIFAxMSwgUDE3Cgl2ZWM0IHAxNCA9IGx1bV90byhQMTQsIFAyLCAgUDEwLCBQMjIpOwoJdmVjNCBwMTYgPSBwOC56d3h5OyAgICAgICAgICAgICAgICAgICAgICAvLyBQMTYsIFAxOCwgUDgsICBQNgoJdmVjNCBwMTcgPSBwNy56d3h5OyAgICAgICAgICAgICAgICAgICAgICAvLyBQMTcsIFAxMywgUDcsICBQMTEKCXZlYzQgcDE4ID0gcDgud3h5ejsgICAgICAgICAgICAgICAgICAgICAgLy8gUDE4LCBQOCwgIFA2LCAgUDE2Cgl2ZWM0IHAxOSA9IGx1bV90byhQMTksIFAzLCAgUDUsICBQMjEpOwoJdmVjNCBwMjIgPSBwMTQud3h5ejsgICAgICAgICAgICAgICAgICAgICAvLyBQMjIsIFAxNCwgUDIsICBQMTAKCXZlYzQgcDIzID0gbHVtX3RvKFAyMywgUDksICBQMSwgIFAxNSk7CgkKCS8vIFNjYWxlIGN1cnJlbnQgdGV4ZWwgY29vcmRpbmF0ZSB0byBbMC4uMV0KCXZlYzIgZnAgPSBmcmFjdCh0YyAqIFNvdXJjZVNpemUueHkpOwoJCgkvLyBEZXRlcm1pbmUgYW1vdW50IG9mICJzbW9vdGhpbmciIG9yIG1peGluZyB0aGF0IGNvdWxkIGJlIGRvbmUgb24gdGV4ZWwgY29ybmVycwoJdmVjNCBtYTQ1ID0gc21vb3Roc3RlcChDNDUgLSBNNDUsIEM0NSArIE00NSwgQWkgKiBmcC55ICsgQjQ1ICogZnAueCk7Cgl2ZWM0IG1hMzAgPSBzbW9vdGhzdGVwKEMzMCAtIE0zMCwgQzMwICsgTTMwLCBBaSAqIGZwLnkgKyBCMzAgKiBmcC54KTsKCXZlYzQgbWE2MCA9IHNtb290aHN0ZXAoQzYwIC0gTTYwLCBDNjAgKyBNNjAsIEFpICogZnAueSArIEI2MCAqIGZwLngpOwoJdmVjNCBtYXJuID0gc21vb3Roc3RlcChDNDUgLSBNNDUgKyBNc2hpZnQsIEM0NSArIE00NSArIE1zaGlmdCwgQWkgKiBmcC55ICsgQjQ1ICogZnAueCk7CgkKCS8vIFBlcmZvcm0gZWRnZSB3ZWlnaHQgY2FsY3VsYXRpb25zCgl2ZWM0IGU0NSAgID0gbHVtX3dkKHAxMiwgcDgsIHAxNiwgcDE4LCBwMjIsIHAxNCwgcDE3LCBwMTMpOwoJdmVjNCBlY29udCA9IGx1bV93ZChwMTcsIHAxMSwgcDIzLCBwMTMsIHA3LCBwMTksIHAxMiwgcDE4KTsKCXZlYzQgZTMwICAgPSBsdW1fZGYocDEzLCBwMTYpOwoJdmVjNCBlNjAgICA9IGx1bV9kZihwOCwgcDE3KTsKCQoJLy8gQ2FsY3VsYXRlIHJ1bGUgcmVzdWx0cyBmb3IgaW50ZXJwb2xhdGlvbgoJYnZlYzQgcjQ1XzEgICA9IF9hbmRfKG5vdEVxdWFsKHAxMiwgcDEzKSwgbm90RXF1YWwocDEyLCBwMTcpKTsKCWJ2ZWM0IHI0NV8yICAgPSBfYW5kXyhub3QobHVtX2VxKHAxMywgcDcpKSwgbm90KGx1bV9lcShwMTMsIHA4KSkpOwoJYnZlYzQgcjQ1XzMgICA9IF9hbmRfKG5vdChsdW1fZXEocDE3LCBwMTEpKSwgbm90KGx1bV9lcShwMTcsIHAxNikpKTsKCWJ2ZWM0IHI0NV80XzEgPSBfYW5kXyhub3QobHVtX2VxKHAxMywgcDE0KSksIG5vdChsdW1fZXEocDEzLCBwMTkpKSk7CglidmVjNCByNDVfNF8yID0gX2FuZF8obm90KGx1bV9lcShwMTcsIHAyMikpLCBub3QobHVtX2VxKHAxNywgcDIzKSkpOwoJYnZlYzQgcjQ1XzQgICA9IF9hbmRfKGx1bV9lcShwMTIsIHAxOCksIF9vcl8ocjQ1XzRfMSwgcjQ1XzRfMikpOwoJYnZlYzQgcjQ1XzUgICA9IF9vcl8obHVtX2VxKHAxMiwgcDE2KSwgbHVtX2VxKHAxMiwgcDgpKTsKCWJ2ZWM0IHI0NSAgICAgPSBfYW5kXyhyNDVfMSwgX29yXyhfb3JfKF9vcl8ocjQ1XzIsIHI0NV8zKSwgcjQ1XzQpLCByNDVfNSkpOwoJYnZlYzQgcjMwID0gX2FuZF8obm90RXF1YWwocDEyLCBwMTYpLCBub3RFcXVhbChwMTEsIHAxNikpOwoJYnZlYzQgcjYwID0gX2FuZF8obm90RXF1YWwocDEyLCBwOCksIG5vdEVxdWFsKHA3LCBwOCkpOwoJCgkvLyBDb21iaW5lIHJ1bGVzIHdpdGggZWRnZSB3ZWlnaHRzCglidmVjNCBlZHI0NSA9IF9hbmRfKGxlc3NUaGFuKGU0NSwgZWNvbnQpLCByNDUpOwoJYnZlYzQgZWRycm4gPSBsZXNzVGhhbkVxdWFsKGU0NSwgZWNvbnQpOwoJYnZlYzQgZWRyMzAgPSBfYW5kXyhsZXNzVGhhbkVxdWFsKGNvZWYgKiBlMzAsIGU2MCksIHIzMCk7CglidmVjNCBlZHI2MCA9IF9hbmRfKGxlc3NUaGFuRXF1YWwoY29lZiAqIGU2MCwgZTMwKSwgcjYwKTsKCQoJLy8gRmluYWxpemUgaW50ZXJwb2xhdGlvbiBydWxlcyBhbmQgY2FzdCB0byBmbG9hdCAoMC4wIGZvciBmYWxzZSwgMS4wIGZvciB0cnVlKQoJdmVjNCBmaW5hbDQ1ID0gdmVjNChfYW5kXyhfYW5kXyhub3QoZWRyMzApLCBub3QoZWRyNjApKSwgZWRyNDUpKTsKCXZlYzQgZmluYWwzMCA9IHZlYzQoX2FuZF8oX2FuZF8oZWRyNDUsIG5vdChlZHI2MCkpLCBlZHIzMCkpOwoJdmVjNCBmaW5hbDYwID0gdmVjNChfYW5kXyhfYW5kXyhlZHI0NSwgbm90KGVkcjMwKSksIGVkcjYwKSk7Cgl2ZWM0IGZpbmFsMzYgPSB2ZWM0KF9hbmRfKF9hbmRfKGVkcjYwLCBlZHIzMCksIGVkcjQ1KSk7Cgl2ZWM0IGZpbmFscm4gPSB2ZWM0KF9hbmRfKG5vdChlZHI0NSksIGVkcnJuKSk7CgkKCS8vIERldGVybWluZSB0aGUgY29sb3IgdG8gbWl4IHdpdGggZm9yIGVhY2ggY29ybmVyCgl2ZWM0IHB4ID0gc3RlcChsdW1fZGYocDEyLCBwMTcpLCBsdW1fZGYocDEyLCBwMTMpKTsKCQoJLy8gRGV0ZXJtaW5lIHRoZSBtaXggYW1vdW50cyBieSBjb21iaW5pbmcgdGhlIGZpbmFsIHJ1bGUgcmVzdWx0IGFuZCBjb3JyZXNwb25kaW5nCgkvLyBtaXggYW1vdW50IGZvciB0aGUgcnVsZSBpbiBlYWNoIGNvcm5lcgoJdmVjNCBtYWMgPSBmaW5hbDM2ICogbWF4KG1hMzAsIG1hNjApICsgZmluYWwzMCAqIG1hMzAgKyBmaW5hbDYwICogbWE2MCArIGZpbmFsNDUgKiBtYTQ1ICsgZmluYWxybiAqIG1hcm47CgkKLyoKQ2FsY3VsYXRlIHRoZSByZXN1bHRpbmcgY29sb3IgYnkgdHJhdmVyc2luZyBjbG9ja3dpc2UgYW5kIGNvdW50ZXItY2xvY2t3aXNlIGFyb3VuZAp0aGUgY29ybmVycyBvZiB0aGUgdGV4ZWwKCkZpbmFsbHkgY2hvb3NlIHRoZSByZXN1bHQgdGhhdCBoYXMgdGhlIGxhcmdlc3QgZGlmZmVyZW5jZSBmcm9tIHRoZSB0ZXhlbCdzIG9yaWdpbmFsCmNvbG9yCiovCgl2ZWMzIHJlczEgPSBQMTI7CglyZXMxID0gbWl4KHJlczEsIG1peChQMTMsIFAxNywgcHgueCksIG1hYy54KTsKCXJlczEgPSBtaXgocmVzMSwgbWl4KFA3LCBQMTMsIHB4LnkpLCBtYWMueSk7CglyZXMxID0gbWl4KHJlczEsIG1peChQMTEsIFA3LCBweC56KSwgbWFjLnopOwoJcmVzMSA9IG1peChyZXMxLCBtaXgoUDE3LCBQMTEsIHB4LncpLCBtYWMudyk7CgkKCXZlYzMgcmVzMiA9IFAxMjsKCXJlczIgPSBtaXgocmVzMiwgbWl4KFAxNywgUDExLCBweC53KSwgbWFjLncpOwoJcmVzMiA9IG1peChyZXMyLCBtaXgoUDExLCBQNywgcHgueiksIG1hYy56KTsKCXJlczIgPSBtaXgocmVzMiwgbWl4KFA3LCBQMTMsIHB4LnkpLCBtYWMueSk7CglyZXMyID0gbWl4KHJlczIsIG1peChQMTMsIFAxNywgcHgueCksIG1hYy54KTsKCQoJRnJhZ0NvbG9yID0gdmVjNChtaXgocmVzMSwgcmVzMiwgc3RlcChjX2RmKFAxMiwgcmVzMSksIGNfZGYoUDEyLCByZXMyKSkpLCAxLjApOwp9IAojZW5kaWYK",
                    },
                ],
            },
            "crt-aperture.glslp": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = crt-aperture.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "crt-aperture.glsl",
                        type: "base64",
                        value:
                            "LyoKICAgIENSVCBTaGFkZXIgYnkgRWFzeU1vZGUKICAgIExpY2Vuc2U6IEdQTAoqLwoKI3ByYWdtYSBwYXJhbWV0ZXIgU0hBUlBORVNTX0lNQUdFICJTaGFycG5lc3MgSW1hZ2UiIDEuMCAxLjAgNS4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBTSEFSUE5FU1NfRURHRVMgIlNoYXJwbmVzcyBFZGdlcyIgMy4wIDEuMCA1LjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIEdMT1dfV0lEVEggIkdsb3cgV2lkdGgiIDAuNSAwLjA1IDAuNjUgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBHTE9XX0hFSUdIVCAiR2xvdyBIZWlnaHQiIDAuNSAwLjA1IDAuNjUgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBHTE9XX0hBTEFUSU9OICJHbG93IEhhbGF0aW9uIiAwLjEgMC4wIDEuMCAwLjAxCiNwcmFnbWEgcGFyYW1ldGVyIEdMT1dfRElGRlVTSU9OICJHbG93IERpZmZ1c2lvbiIgMC4wNSAwLjAgMS4wIDAuMDEKI3ByYWdtYSBwYXJhbWV0ZXIgTUFTS19DT0xPUlMgIk1hc2sgQ29sb3JzIiAyLjAgMi4wIDMuMCAxLjAKI3ByYWdtYSBwYXJhbWV0ZXIgTUFTS19TVFJFTkdUSCAiTWFzayBTdHJlbmd0aCIgMC4zIDAuMCAxLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBNQVNLX1NJWkUgIk1hc2sgU2l6ZSIgMS4wIDEuMCA5LjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIFNDQU5MSU5FX1NJWkVfTUlOICJTY2FubGluZSBTaXplIE1pbi4iIDAuNSAwLjUgMS41IDAuMDUKI3ByYWdtYSBwYXJhbWV0ZXIgU0NBTkxJTkVfU0laRV9NQVggIlNjYW5saW5lIFNpemUgTWF4LiIgMS41IDAuNSAxLjUgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBTQ0FOTElORV9TSEFQRSAiU2NhbmxpbmUgU2hhcGUiIDIuNSAxLjAgMTAwLjAgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIFNDQU5MSU5FX09GRlNFVCAiU2NhbmxpbmUgT2Zmc2V0IiAxLjAgMC4wIDEuMCAxLjAKI3ByYWdtYSBwYXJhbWV0ZXIgR0FNTUFfSU5QVVQgIkdhbW1hIElucHV0IiAyLjQgMS4wIDUuMCAwLjEKI3ByYWdtYSBwYXJhbWV0ZXIgR0FNTUFfT1VUUFVUICJHYW1tYSBPdXRwdXQiIDIuNCAxLjAgNS4wIDAuMQojcHJhZ21hIHBhcmFtZXRlciBCUklHSFRORVNTICJCcmlnaHRuZXNzIiAxLjUgMC4wIDIuMCAwLjA1CgojZGVmaW5lIENvb3JkIFRFWDAKCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBPVVQgb3V0CiNkZWZpbmUgSU4gIGluCiNkZWZpbmUgdGV4MkQgdGV4dHVyZQojZWxzZQojZGVmaW5lIE9VVCB2YXJ5aW5nIAojZGVmaW5lIElOIGF0dHJpYnV0ZSAKI2RlZmluZSB0ZXgyRCB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2RlZmluZSBQUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIFBSRUNJU0lPTgojZW5kaWYKCklOICB2ZWM0IFZlcnRleENvb3JkOwpJTiAgdmVjNCBDb2xvcjsKSU4gIHZlYzIgVGV4Q29vcmQ7Ck9VVCB2ZWM0IGNvbG9yOwpPVVQgdmVjMiBDb29yZDsKCnVuaWZvcm0gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBQUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBQUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBQUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7Cgp2b2lkIG1haW4oKQp7CiAgICBnbF9Qb3NpdGlvbiA9IE1WUE1hdHJpeCAqIFZlcnRleENvb3JkOwogICAgY29sb3IgPSBDb2xvcjsKICAgIENvb3JkID0gVGV4Q29vcmQgKiAxLjAwMDE7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgSU4gaW4KI2RlZmluZSB0ZXgyRCB0ZXh0dXJlCm91dCB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBJTiB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIHRleDJEIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojaWZkZWYgR0xfRlJBR01FTlRfUFJFQ0lTSU9OX0hJR0gKcHJlY2lzaW9uIGhpZ2hwIGZsb2F0OwojZWxzZQpwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsKI2VuZGlmCiNkZWZpbmUgUFJFQ0lTSU9OIG1lZGl1bXAKI2Vsc2UKI2RlZmluZSBQUkVDSVNJT04KI2VuZGlmCgp1bmlmb3JtIFBSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIFBSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwp1bmlmb3JtIHNhbXBsZXIyRCBUZXh0dXJlOwpJTiB2ZWMyIENvb3JkOwoKI2lmZGVmIFBBUkFNRVRFUl9VTklGT1JNCnVuaWZvcm0gUFJFQ0lTSU9OIGZsb2F0IFNIQVJQTkVTU19JTUFHRTsKdW5pZm9ybSBQUkVDSVNJT04gZmxvYXQgU0hBUlBORVNTX0VER0VTOwp1bmlmb3JtIFBSRUNJU0lPTiBmbG9hdCBHTE9XX1dJRFRIOwp1bmlmb3JtIFBSRUNJU0lPTiBmbG9hdCBHTE9XX0hFSUdIVDsKdW5pZm9ybSBQUkVDSVNJT04gZmxvYXQgR0xPV19IQUxBVElPTjsKdW5pZm9ybSBQUkVDSVNJT04gZmxvYXQgR0xPV19ESUZGVVNJT047CnVuaWZvcm0gUFJFQ0lTSU9OIGZsb2F0IE1BU0tfQ09MT1JTOwp1bmlmb3JtIFBSRUNJU0lPTiBmbG9hdCBNQVNLX1NUUkVOR1RIOwp1bmlmb3JtIFBSRUNJU0lPTiBmbG9hdCBNQVNLX1NJWkU7CnVuaWZvcm0gUFJFQ0lTSU9OIGZsb2F0IFNDQU5MSU5FX1NJWkVfTUlOOwp1bmlmb3JtIFBSRUNJU0lPTiBmbG9hdCBTQ0FOTElORV9TSVpFX01BWDsKdW5pZm9ybSBQUkVDSVNJT04gZmxvYXQgU0NBTkxJTkVfU0hBUEU7CnVuaWZvcm0gUFJFQ0lTSU9OIGZsb2F0IFNDQU5MSU5FX09GRlNFVDsKdW5pZm9ybSBQUkVDSVNJT04gZmxvYXQgR0FNTUFfSU5QVVQ7CnVuaWZvcm0gUFJFQ0lTSU9OIGZsb2F0IEdBTU1BX09VVFBVVDsKdW5pZm9ybSBQUkVDSVNJT04gZmxvYXQgQlJJR0hUTkVTUzsKI2Vsc2UKI2RlZmluZSBTSEFSUE5FU1NfSU1BR0UgMS4wCiNkZWZpbmUgU0hBUlBORVNTX0VER0VTIDMuMAojZGVmaW5lIEdMT1dfV0lEVEggMC41CiNkZWZpbmUgR0xPV19IRUlHSFQgMC41CiNkZWZpbmUgR0xPV19IQUxBVElPTiAwLjEKI2RlZmluZSBHTE9XX0RJRkZVU0lPTiAwLjA1CiNkZWZpbmUgTUFTS19DT0xPUlMgMi4wCiNkZWZpbmUgTUFTS19TVFJFTkdUSCAwLjMKI2RlZmluZSBNQVNLX1NJWkUgMS4wCiNkZWZpbmUgU0NBTkxJTkVfU0laRV9NSU4gMC41CiNkZWZpbmUgU0NBTkxJTkVfU0laRV9NQVggMS41CiNkZWZpbmUgU0NBTkxJTkVfU0hBUEUgMS41CiNkZWZpbmUgU0NBTkxJTkVfT0ZGU0VUIDEuMAojZGVmaW5lIEdBTU1BX0lOUFVUIDIuNAojZGVmaW5lIEdBTU1BX09VVFBVVCAyLjQKI2RlZmluZSBCUklHSFRORVNTIDEuNQojZW5kaWYKCiNkZWZpbmUgRklYKGMpIG1heChhYnMoYyksIDFlLTUpCiNkZWZpbmUgUEkgMy4xNDE1OTI2NTM1ODkKI2RlZmluZSBzYXR1cmF0ZShjKSBjbGFtcChjLCAwLjAsIDEuMCkKI2RlZmluZSBURVgyRChjKSBwb3codGV4MkQodGV4LCBjKS5yZ2IsIHZlYzMoR0FNTUFfSU5QVVQpKQoKbWF0MyBnZXRfY29sb3JfbWF0cml4KHNhbXBsZXIyRCB0ZXgsIHZlYzIgY28sIHZlYzIgZHgpCnsKICAgIHJldHVybiBtYXQzKFRFWDJEKGNvIC0gZHgpLCBURVgyRChjbyksIFRFWDJEKGNvICsgZHgpKTsKfQoKdmVjMyBibHVyKG1hdDMgbSwgZmxvYXQgZGlzdCwgZmxvYXQgcmFkKQp7CiAgICB2ZWMzIHggPSB2ZWMzKGRpc3QgLSAxLjAsIGRpc3QsIGRpc3QgKyAxLjApIC8gcmFkOwogICAgdmVjMyB3ID0gZXhwMih4ICogeCAqIC0xLjApOwoKICAgIHJldHVybiAobVswXSAqIHcueCArIG1bMV0gKiB3LnkgKyBtWzJdICogdy56KSAvICh3LnggKyB3LnkgKyB3LnopOwp9Cgp2ZWMzIGZpbHRlcl9nYXVzc2lhbihzYW1wbGVyMkQgdGV4LCB2ZWMyIGNvLCB2ZWMyIHRleF9zaXplKQp7CiAgICB2ZWMyIGR4ID0gdmVjMigxLjAgLyB0ZXhfc2l6ZS54LCAwLjApOwogICAgdmVjMiBkeSA9IHZlYzIoMC4wLCAxLjAgLyB0ZXhfc2l6ZS55KTsKICAgIHZlYzIgcGl4X2NvID0gY28gKiB0ZXhfc2l6ZTsKICAgIHZlYzIgdGV4X2NvID0gKGZsb29yKHBpeF9jbykgKyAwLjUpIC8gdGV4X3NpemU7CiAgICB2ZWMyIGRpc3QgPSAoZnJhY3QocGl4X2NvKSAtIDAuNSkgKiAtMS4wOwoKICAgIG1hdDMgbGluZTAgPSBnZXRfY29sb3JfbWF0cml4KHRleCwgdGV4X2NvIC0gZHksIGR4KTsKICAgIG1hdDMgbGluZTEgPSBnZXRfY29sb3JfbWF0cml4KHRleCwgdGV4X2NvLCBkeCk7CiAgICBtYXQzIGxpbmUyID0gZ2V0X2NvbG9yX21hdHJpeCh0ZXgsIHRleF9jbyArIGR5LCBkeCk7CiAgICBtYXQzIGNvbHVtbiA9IG1hdDMoYmx1cihsaW5lMCwgZGlzdC54LCBHTE9XX1dJRFRIKSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsdXIobGluZTEsIGRpc3QueCwgR0xPV19XSURUSCksCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibHVyKGxpbmUyLCBkaXN0LngsIEdMT1dfV0lEVEgpKTsKCiAgICByZXR1cm4gYmx1cihjb2x1bW4sIGRpc3QueSwgR0xPV19IRUlHSFQpOwp9Cgp2ZWMzIGZpbHRlcl9sYW5jem9zKHNhbXBsZXIyRCB0ZXgsIHZlYzIgY28sIHZlYzIgdGV4X3NpemUsIGZsb2F0IHNoYXJwKQp7CiAgICB0ZXhfc2l6ZS54ICo9IHNoYXJwOwoKICAgIHZlYzIgZHggPSB2ZWMyKDEuMCAvIHRleF9zaXplLngsIDAuMCk7CiAgICB2ZWMyIHBpeF9jbyA9IGNvICogdGV4X3NpemUgLSB2ZWMyKDAuNSwgMC4wKTsKICAgIHZlYzIgdGV4X2NvID0gKGZsb29yKHBpeF9jbykgKyB2ZWMyKDAuNSwgMC4wKSkgLyB0ZXhfc2l6ZTsKICAgIHZlYzIgZGlzdCA9IGZyYWN0KHBpeF9jbyk7CiAgICB2ZWM0IGNvZWYgPSBQSSAqIHZlYzQoZGlzdC54ICsgMS4wLCBkaXN0LngsIGRpc3QueCAtIDEuMCwgZGlzdC54IC0gMi4wKTsKCiAgICBjb2VmID0gRklYKGNvZWYpOwogICAgY29lZiA9IDIuMCAqIHNpbihjb2VmKSAqIHNpbihjb2VmIC8gMi4wKSAvIChjb2VmICogY29lZik7CiAgICBjb2VmIC89IGRvdChjb2VmLCB2ZWM0KDEuMCkpOwoKICAgIHZlYzQgY29sMSA9IHZlYzQoVEVYMkQodGV4X2NvKSwgMS4wKTsKICAgIHZlYzQgY29sMiA9IHZlYzQoVEVYMkQodGV4X2NvICsgZHgpLCAxLjApOwoKICAgIHJldHVybiAobWF0NChjb2wxLCBjb2wxLCBjb2wyLCBjb2wyKSAqIGNvZWYpLnJnYjsKfQoKdmVjMyBnZXRfc2NhbmxpbmVfd2VpZ2h0KGZsb2F0IHgsIHZlYzMgY29sKQp7CiAgICB2ZWMzIGJlYW0gPSBtaXgodmVjMyhTQ0FOTElORV9TSVpFX01JTiksIHZlYzMoU0NBTkxJTkVfU0laRV9NQVgpLCBwb3coY29sLCB2ZWMzKDEuMCAvIFNDQU5MSU5FX1NIQVBFKSkpOwogICAgdmVjMyB4X211bCA9IDIuMCAvIGJlYW07CiAgICB2ZWMzIHhfb2Zmc2V0ID0geF9tdWwgKiAwLjU7CgogICAgcmV0dXJuIHNtb290aHN0ZXAoMC4wLCAxLjAsIDEuMCAtIGFicyh4ICogeF9tdWwgLSB4X29mZnNldCkpICogeF9vZmZzZXQ7Cn0KCnZlYzMgZ2V0X21hc2tfd2VpZ2h0KGZsb2F0IHgpCnsKICAgIGZsb2F0IGkgPSBtb2QoZmxvb3IoeCAqIE91dHB1dFNpemUueCAqIFRleHR1cmVTaXplLnggLyAoSW5wdXRTaXplLnggKiBNQVNLX1NJWkUpKSwgTUFTS19DT0xPUlMpOwoKICAgIGlmIChpID09IDAuMCkgcmV0dXJuIG1peCh2ZWMzKDEuMCwgMC4wLCAxLjApLCB2ZWMzKDEuMCwgMC4wLCAwLjApLCBNQVNLX0NPTE9SUyAtIDIuMCk7CiAgICBlbHNlIGlmIChpID09IDEuMCkgcmV0dXJuIHZlYzMoMC4wLCAxLjAsIDAuMCk7CiAgICBlbHNlIHJldHVybiB2ZWMzKDAuMCwgMC4wLCAxLjApOwp9Cgp2b2lkIG1haW4oKQp7CiAgICBmbG9hdCBzY2FsZSA9IGZsb29yKChPdXRwdXRTaXplLnkgLyBJbnB1dFNpemUueSkgKyAwLjAwMSk7CiAgICBmbG9hdCBvZmZzZXQgPSAxLjAgLyBzY2FsZSAqIDAuNTsKICAgIAogICAgaWYgKGJvb2wobW9kKHNjYWxlLCAyLjApKSkgb2Zmc2V0ID0gMC4wOwogICAgCiAgICB2ZWMyIGNvID0gKENvb3JkICogVGV4dHVyZVNpemUgLSB2ZWMyKDAuMCwgb2Zmc2V0ICogU0NBTkxJTkVfT0ZGU0VUKSkgLyBUZXh0dXJlU2l6ZTsKCiAgICB2ZWMzIGNvbF9nbG93ID0gZmlsdGVyX2dhdXNzaWFuKFRleHR1cmUsIGNvLCBUZXh0dXJlU2l6ZSk7CiAgICB2ZWMzIGNvbF9zb2Z0ID0gZmlsdGVyX2xhbmN6b3MoVGV4dHVyZSwgY28sIFRleHR1cmVTaXplLCBTSEFSUE5FU1NfSU1BR0UpOwogICAgdmVjMyBjb2xfc2hhcnAgPSBmaWx0ZXJfbGFuY3pvcyhUZXh0dXJlLCBjbywgVGV4dHVyZVNpemUsIFNIQVJQTkVTU19FREdFUyk7CiAgICB2ZWMzIGNvbCA9IHNxcnQoY29sX3NoYXJwICogY29sX3NvZnQpOwoKICAgIGNvbCAqPSBnZXRfc2NhbmxpbmVfd2VpZ2h0KGZyYWN0KGNvLnkgKiBUZXh0dXJlU2l6ZS55KSwgY29sX3NvZnQpOwogICAgY29sX2dsb3cgPSBzYXR1cmF0ZShjb2xfZ2xvdyAtIGNvbCk7CiAgICBjb2wgKz0gY29sX2dsb3cgKiBjb2xfZ2xvdyAqIEdMT1dfSEFMQVRJT047CiAgICBjb2wgPSBtaXgoY29sLCBjb2wgKiBnZXRfbWFza193ZWlnaHQoY28ueCkgKiBNQVNLX0NPTE9SUywgTUFTS19TVFJFTkdUSCk7CiAgICBjb2wgKz0gY29sX2dsb3cgKiBHTE9XX0RJRkZVU0lPTjsKICAgIGNvbCA9IHBvdyhjb2wgKiBCUklHSFRORVNTLCB2ZWMzKDEuMCAvIEdBTU1BX09VVFBVVCkpOwoKICAgIEZyYWdDb2xvciA9IHZlYzQoY29sLCAxLjApOwp9CgojZW5kaWYK",
                    },
                ],
            },
            "crt-easymode.glslp": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = crt-easymode.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "crt-easymode.glsl",
                        type: "base64",
                        value:
                            "LyoKICAgIENSVCBTaGFkZXIgYnkgRWFzeU1vZGUKICAgIExpY2Vuc2U6IEdQTAoKICAgIEEgZmxhdCBDUlQgc2hhZGVyIGlkZWFsbHkgZm9yIDEwODBwIG9yIGhpZ2hlciBkaXNwbGF5cy4KCiAgICBSZWNvbW1lbmRlZCBTZXR0aW5nczoKCiAgICBWaWRlbwogICAgLSBBc3BlY3QgUmF0aW86ICA0OjMKICAgIC0gSW50ZWdlciBTY2FsZTogT2ZmCgogICAgU2hhZGVyCiAgICAtIEZpbHRlcjogTmVhcmVzdAogICAgLSBTY2FsZTogIERvbid0IENhcmUKCiAgICBFeGFtcGxlIFJHQiBNYXNrIFBhcmFtZXRlciBTZXR0aW5nczoKCiAgICBBcGVydHVyZSBHcmlsbGUgKERlZmF1bHQpCiAgICAtIERvdCBXaWR0aDogIDEKICAgIC0gRG90IEhlaWdodDogMQogICAgLSBTdGFnZ2VyOiAgICAwCgogICAgTG90dGVzJyBTaGFkb3cgTWFzawogICAgLSBEb3QgV2lkdGg6ICAyCiAgICAtIERvdCBIZWlnaHQ6IDEKICAgIC0gU3RhZ2dlcjogICAgMwoqLwoKLy8gUGFyYW1ldGVyIGxpbmVzIGdvIGhlcmU6CiNwcmFnbWEgcGFyYW1ldGVyIFNIQVJQTkVTU19IICJTaGFycG5lc3MgSG9yaXpvbnRhbCIgMC41IDAuMCAxLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBTSEFSUE5FU1NfViAiU2hhcnBuZXNzIFZlcnRpY2FsIiAxLjAgMC4wIDEuMCAwLjA1CiNwcmFnbWEgcGFyYW1ldGVyIE1BU0tfU1RSRU5HVEggIk1hc2sgU3RyZW5ndGgiIDAuMyAwLjAgMS4wIDAuMDEKI3ByYWdtYSBwYXJhbWV0ZXIgTUFTS19ET1RfV0lEVEggIk1hc2sgRG90IFdpZHRoIiAxLjAgMS4wIDEwMC4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBNQVNLX0RPVF9IRUlHSFQgIk1hc2sgRG90IEhlaWdodCIgMS4wIDEuMCAxMDAuMCAxLjAKI3ByYWdtYSBwYXJhbWV0ZXIgTUFTS19TVEFHR0VSICJNYXNrIFN0YWdnZXIiIDAuMCAwLjAgMTAwLjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIE1BU0tfU0laRSAiTWFzayBTaXplIiAxLjAgMS4wIDEwMC4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBTQ0FOTElORV9TVFJFTkdUSCAiU2NhbmxpbmUgU3RyZW5ndGgiIDEuMCAwLjAgMS4wIDAuMDUKI3ByYWdtYSBwYXJhbWV0ZXIgU0NBTkxJTkVfQkVBTV9XSURUSF9NSU4gIlNjYW5saW5lIEJlYW0gV2lkdGggTWluLiIgMS41IDAuNSA1LjAgMC41CiNwcmFnbWEgcGFyYW1ldGVyIFNDQU5MSU5FX0JFQU1fV0lEVEhfTUFYICJTY2FubGluZSBCZWFtIFdpZHRoIE1heC4iIDEuNSAwLjUgNS4wIDAuNQojcHJhZ21hIHBhcmFtZXRlciBTQ0FOTElORV9CUklHSFRfTUlOICJTY2FubGluZSBCcmlnaHRuZXNzIE1pbi4iIDAuMzUgMC4wIDEuMCAwLjA1CiNwcmFnbWEgcGFyYW1ldGVyIFNDQU5MSU5FX0JSSUdIVF9NQVggIlNjYW5saW5lIEJyaWdodG5lc3MgTWF4LiIgMC42NSAwLjAgMS4wIDAuMDUKI3ByYWdtYSBwYXJhbWV0ZXIgU0NBTkxJTkVfQ1VUT0ZGICJTY2FubGluZSBDdXRvZmYiIDQwMC4wIDEuMCAxMDAwLjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIEdBTU1BX0lOUFVUICJHYW1tYSBJbnB1dCIgMi4wIDAuMSA1LjAgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIEdBTU1BX09VVFBVVCAiR2FtbWEgT3V0cHV0IiAxLjggMC4xIDUuMCAwLjEKI3ByYWdtYSBwYXJhbWV0ZXIgQlJJR0hUX0JPT1NUICJCcmlnaHRuZXNzIEJvb3N0IiAxLjIgMS4wIDIuMCAwLjAxCiNwcmFnbWEgcGFyYW1ldGVyIERJTEFUSU9OICJEaWxhdGlvbiIgMS4wIDAuMCAxLjAgMS4wCgojaWYgZGVmaW5lZChWRVJURVgpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgb3V0CiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBpbgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nIAojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgYXR0cmlidXRlIAojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgpDT01QQVRfQVRUUklCVVRFIHZlYzQgVmVydGV4Q29vcmQ7CkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBDT0xPUjsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IFRleENvb3JkOwpDT01QQVRfVkFSWUlORyB2ZWM0IENPTDA7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKCnZlYzQgX29Qb3NpdGlvbjE7IAp1bmlmb3JtIG1hdDQgTVZQTWF0cml4Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7Cgp2b2lkIG1haW4oKQp7CiAgICBnbF9Qb3NpdGlvbiA9IE1WUE1hdHJpeCAqIFZlcnRleENvb3JkOwogICAgQ09MMCA9IENPTE9SOwogICAgVEVYMC54eSA9IFRleENvb3JkLnh5Owp9CgojZWxpZiBkZWZpbmVkKEZSQUdNRU5UKQoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQpvdXQgdmVjNCBGcmFnQ29sb3I7CiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZwojZGVmaW5lIEZyYWdDb2xvciBnbF9GcmFnQ29sb3IKI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdICnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2Vsc2UKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CnByZWNpc2lvbiBtZWRpdW1wIGludDsKI2VuZGlmCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwoKI2RlZmluZSBGSVgoYykgbWF4KGFicyhjKSwgMWUtNSkKI2RlZmluZSBQSSAzLjE0MTU5MjY1MzU4OQoKI2RlZmluZSBURVgyRChjKSBkaWxhdGUoQ09NUEFUX1RFWFRVUkUoVGV4dHVyZSwgYykpCgovLyBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgU291cmNlIFRleHR1cmUKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQoKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBvdXRzaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQovLyBBbGwgcGFyYW1ldGVyIGZsb2F0cyBuZWVkIHRvIGhhdmUgQ09NUEFUX1BSRUNJU0lPTiBpbiBmcm9udCBvZiB0aGVtCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBTSEFSUE5FU1NfSDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IFNIQVJQTkVTU19WOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgTUFTS19TVFJFTkdUSDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IE1BU0tfRE9UX1dJRFRIOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgTUFTS19ET1RfSEVJR0hUOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgTUFTS19TVEFHR0VSOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgTUFTS19TSVpFOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgU0NBTkxJTkVfU1RSRU5HVEg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBTQ0FOTElORV9CRUFNX1dJRFRIX01JTjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IFNDQU5MSU5FX0JFQU1fV0lEVEhfTUFYOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgU0NBTkxJTkVfQlJJR0hUX01JTjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IFNDQU5MSU5FX0JSSUdIVF9NQVg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBTQ0FOTElORV9DVVRPRkY7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBHQU1NQV9JTlBVVDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IEdBTU1BX09VVFBVVDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IEJSSUdIVF9CT09TVDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IERJTEFUSU9OOwojZWxzZQojZGVmaW5lIFNIQVJQTkVTU19IIDAuNQojZGVmaW5lIFNIQVJQTkVTU19WIDEuMAojZGVmaW5lIE1BU0tfU1RSRU5HVEggMC4zCiNkZWZpbmUgTUFTS19ET1RfV0lEVEggMS4wCiNkZWZpbmUgTUFTS19ET1RfSEVJR0hUIDEuMAojZGVmaW5lIE1BU0tfU1RBR0dFUiAwLjAKI2RlZmluZSBNQVNLX1NJWkUgMS4wCiNkZWZpbmUgU0NBTkxJTkVfU1RSRU5HVEggMS4wCiNkZWZpbmUgU0NBTkxJTkVfQkVBTV9XSURUSF9NSU4gMS41CiNkZWZpbmUgU0NBTkxJTkVfQkVBTV9XSURUSF9NQVggMS41CiNkZWZpbmUgU0NBTkxJTkVfQlJJR0hUX01JTiAwLjM1CiNkZWZpbmUgU0NBTkxJTkVfQlJJR0hUX01BWCAwLjY1CiNkZWZpbmUgU0NBTkxJTkVfQ1VUT0ZGIDQwMC4wCiNkZWZpbmUgR0FNTUFfSU5QVVQgMi4wCiNkZWZpbmUgR0FNTUFfT1VUUFVUIDEuOAojZGVmaW5lIEJSSUdIVF9CT09TVCAxLjIKI2RlZmluZSBESUxBVElPTiAxLjAKI2VuZGlmCgovLyBTZXQgdG8gMCB0byB1c2UgbGluZWFyIGZpbHRlciBhbmQgZ2FpbiBzcGVlZAojZGVmaW5lIEVOQUJMRV9MQU5DWk9TIDEKCnZlYzQgZGlsYXRlKHZlYzQgY29sKQp7CiAgICB2ZWM0IHggPSBtaXgodmVjNCgxLjApLCBjb2wsIERJTEFUSU9OKTsKCiAgICByZXR1cm4gY29sICogeDsKfQoKZmxvYXQgY3VydmVfZGlzdGFuY2UoZmxvYXQgeCwgZmxvYXQgc2hhcnApCnsKCi8qCiAgICBhcHBseSBoYWxmLWNpcmNsZSBzLWN1cnZlIHRvIGRpc3RhbmNlIGZvciBzaGFycGVyIChtb3JlIHBpeGVsYXRlZCkgaW50ZXJwb2xhdGlvbgogICAgc2luZ2xlIGxpbmUgZm9ybXVsYSBmb3IgR3JhcGggVG95OgogICAgMC41IC0gc3FydCgwLjI1IC0gKHggLSBzdGVwKDAuNSwgeCkpICogKHggLSBzdGVwKDAuNSwgeCkpKSAqIHNpZ24oMC41IC0geCkKKi8KCiAgICBmbG9hdCB4X3N0ZXAgPSBzdGVwKDAuNSwgeCk7CiAgICBmbG9hdCBjdXJ2ZSA9IDAuNSAtIHNxcnQoMC4yNSAtICh4IC0geF9zdGVwKSAqICh4IC0geF9zdGVwKSkgKiBzaWduKDAuNSAtIHgpOwoKICAgIHJldHVybiBtaXgoeCwgY3VydmUsIHNoYXJwKTsKfQoKbWF0NCBnZXRfY29sb3JfbWF0cml4KHZlYzIgY28sIHZlYzIgZHgpCnsKICAgIHJldHVybiBtYXQ0KFRFWDJEKGNvIC0gZHgpLCBURVgyRChjbyksIFRFWDJEKGNvICsgZHgpLCBURVgyRChjbyArIDIuMCAqIGR4KSk7Cn0KCnZlYzMgZmlsdGVyX2xhbmN6b3ModmVjNCBjb2VmZnMsIG1hdDQgY29sb3JfbWF0cml4KQp7CiAgICB2ZWM0IGNvbCAgICAgICAgPSBjb2xvcl9tYXRyaXggKiBjb2VmZnM7CiAgICB2ZWM0IHNhbXBsZV9taW4gPSBtaW4oY29sb3JfbWF0cml4WzFdLCBjb2xvcl9tYXRyaXhbMl0pOwogICAgdmVjNCBzYW1wbGVfbWF4ID0gbWF4KGNvbG9yX21hdHJpeFsxXSwgY29sb3JfbWF0cml4WzJdKTsKCiAgICBjb2wgPSBjbGFtcChjb2wsIHNhbXBsZV9taW4sIHNhbXBsZV9tYXgpOwoKICAgIHJldHVybiBjb2wucmdiOwp9Cgp2b2lkIG1haW4oKQp7CiAgICB2ZWMyIGR4ICAgICA9IHZlYzIoU291cmNlU2l6ZS56LCAwLjApOwogICAgdmVjMiBkeSAgICAgPSB2ZWMyKDAuMCwgU291cmNlU2l6ZS53KTsKICAgIHZlYzIgcGl4X2NvID0gdlRleENvb3JkICogU291cmNlU2l6ZS54eSAtIHZlYzIoMC41LCAwLjUpOwogICAgdmVjMiB0ZXhfY28gPSAoZmxvb3IocGl4X2NvKSArIHZlYzIoMC41LCAwLjUpKSAqIFNvdXJjZVNpemUuenc7CiAgICB2ZWMyIGRpc3QgICA9IGZyYWN0KHBpeF9jbyk7CiAgICBmbG9hdCBjdXJ2ZV94OwogICAgdmVjMyBjb2wsIGNvbDI7CgojaWYgRU5BQkxFX0xBTkNaT1MKICAgIGN1cnZlX3ggPSBjdXJ2ZV9kaXN0YW5jZShkaXN0LngsIFNIQVJQTkVTU19IICogU0hBUlBORVNTX0gpOwoKICAgIHZlYzQgY29lZmZzID0gUEkgKiB2ZWM0KDEuMCArIGN1cnZlX3gsIGN1cnZlX3gsIDEuMCAtIGN1cnZlX3gsIDIuMCAtIGN1cnZlX3gpOwoKICAgIGNvZWZmcyA9IEZJWChjb2VmZnMpOwogICAgY29lZmZzID0gMi4wICogc2luKGNvZWZmcykgKiBzaW4oY29lZmZzICogMC41KSAvIChjb2VmZnMgKiBjb2VmZnMpOwogICAgY29lZmZzIC89IGRvdChjb2VmZnMsIHZlYzQoMS4wKSk7CgogICAgY29sICA9IGZpbHRlcl9sYW5jem9zKGNvZWZmcywgZ2V0X2NvbG9yX21hdHJpeCh0ZXhfY28sIGR4KSk7CiAgICBjb2wyID0gZmlsdGVyX2xhbmN6b3MoY29lZmZzLCBnZXRfY29sb3JfbWF0cml4KHRleF9jbyArIGR5LCBkeCkpOwojZWxzZQogICAgY3VydmVfeCA9IGN1cnZlX2Rpc3RhbmNlKGRpc3QueCwgU0hBUlBORVNTX0gpOwoKICAgIGNvbCAgPSBtaXgoVEVYMkQodGV4X2NvKS5yZ2IsICAgICAgVEVYMkQodGV4X2NvICsgZHgpLnJnYiwgICAgICBjdXJ2ZV94KTsKICAgIGNvbDIgPSBtaXgoVEVYMkQodGV4X2NvICsgZHkpLnJnYiwgVEVYMkQodGV4X2NvICsgZHggKyBkeSkucmdiLCBjdXJ2ZV94KTsKI2VuZGlmCgogICAgY29sID0gbWl4KGNvbCwgY29sMiwgY3VydmVfZGlzdGFuY2UoZGlzdC55LCBTSEFSUE5FU1NfVikpOwogICAgY29sID0gcG93KGNvbCwgdmVjMyhHQU1NQV9JTlBVVCAvIChESUxBVElPTiArIDEuMCkpKTsKCiAgICBmbG9hdCBsdW1hICAgICAgICA9IGRvdCh2ZWMzKDAuMjEyNiwgMC43MTUyLCAwLjA3MjIpLCBjb2wpOwogICAgZmxvYXQgYnJpZ2h0ICAgICAgPSAobWF4KGNvbC5yLCBtYXgoY29sLmcsIGNvbC5iKSkgKyBsdW1hKSAqIDAuNTsKICAgIGZsb2F0IHNjYW5fYnJpZ2h0ID0gY2xhbXAoYnJpZ2h0LCBTQ0FOTElORV9CUklHSFRfTUlOLCBTQ0FOTElORV9CUklHSFRfTUFYKTsKICAgIGZsb2F0IHNjYW5fYmVhbSAgID0gY2xhbXAoYnJpZ2h0ICogU0NBTkxJTkVfQkVBTV9XSURUSF9NQVgsIFNDQU5MSU5FX0JFQU1fV0lEVEhfTUlOLCBTQ0FOTElORV9CRUFNX1dJRFRIX01BWCk7CiAgICBmbG9hdCBzY2FuX3dlaWdodCA9IDEuMCAtIHBvdyhjb3ModlRleENvb3JkLnkgKiAyLjAgKiBQSSAqIFNvdXJjZVNpemUueSkgKiAwLjUgKyAwLjUsIHNjYW5fYmVhbSkgKiBTQ0FOTElORV9TVFJFTkdUSDsKCiAgICBmbG9hdCBtYXNrICAgPSAxLjAgLSBNQVNLX1NUUkVOR1RIOyAgICAKICAgIHZlYzIgbW9kX2ZhYyA9IGZsb29yKHZUZXhDb29yZCAqIG91dHNpemUueHkgKiBTb3VyY2VTaXplLnh5IC8gKElucHV0U2l6ZS54eSAqIHZlYzIoTUFTS19TSVpFLCBNQVNLX0RPVF9IRUlHSFQgKiBNQVNLX1NJWkUpKSk7CiAgICBpbnQgZG90X25vICAgPSBpbnQobW9kKChtb2RfZmFjLnggKyBtb2QobW9kX2ZhYy55LCAyLjApICogTUFTS19TVEFHR0VSKSAvIE1BU0tfRE9UX1dJRFRILCAzLjApKTsKICAgIHZlYzMgbWFza193ZWlnaHQ7CgogICAgaWYgICAgICAoZG90X25vID09IDApIG1hc2tfd2VpZ2h0ID0gdmVjMygxLjAsICBtYXNrLCBtYXNrKTsKICAgIGVsc2UgaWYgKGRvdF9ubyA9PSAxKSBtYXNrX3dlaWdodCA9IHZlYzMobWFzaywgMS4wLCAgbWFzayk7CiAgICBlbHNlICAgICAgICAgICAgICAgICAgbWFza193ZWlnaHQgPSB2ZWMzKG1hc2ssIG1hc2ssIDEuMCk7CgogICAgaWYgKElucHV0U2l6ZS55ID49IFNDQU5MSU5FX0NVVE9GRikgCiAgICAgICAgc2Nhbl93ZWlnaHQgPSAxLjA7CgogICAgY29sMiA9IGNvbC5yZ2I7CiAgICBjb2wgKj0gdmVjMyhzY2FuX3dlaWdodCk7CiAgICBjb2wgID0gbWl4KGNvbCwgY29sMiwgc2Nhbl9icmlnaHQpOwogICAgY29sICo9IG1hc2tfd2VpZ2h0OwogICAgY29sICA9IHBvdyhjb2wsIHZlYzMoMS4wIC8gR0FNTUFfT1VUUFVUKSk7CgogICAgRnJhZ0NvbG9yID0gdmVjNChjb2wgKiBCUklHSFRfQk9PU1QsIDEuMCk7Cn0gCiNlbmRpZgo=",
                    },
                ],
            },
            "crt-geom.glslp": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = crt-geom.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "crt-geom.glsl",
                        type: "base64",
                        value:
                            "LyoKICAgIENSVC1pbnRlcmxhY2VkCgogICAgQ29weXJpZ2h0IChDKSAyMDEwLTIwMTIgY2d3ZywgVGhlbWFpc3RlciBhbmQgRE9MTFMKCiAgICBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdAogICAgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUKICAgIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yIChhdCB5b3VyIG9wdGlvbikKICAgIGFueSBsYXRlciB2ZXJzaW9uLgoKICAgIChjZ3dnIGdhdmUgdGhlaXIgY29uc2VudCB0byBoYXZlIHRoZSBvcmlnaW5hbCB2ZXJzaW9uIG9mIHRoaXMgc2hhZGVyCiAgICBkaXN0cmlidXRlZCB1bmRlciB0aGUgR1BMIGluIHRoaXMgbWVzc2FnZToKCiAgICAgICAgaHR0cDovL2JvYXJkLmJ5dXUub3JnL3ZpZXd0b3BpYy5waHA/cD0yNjA3NSNwMjYwNzUKCiAgICAgICAgIkZlZWwgZnJlZSB0byBkaXN0cmlidXRlIG15IHNoYWRlcnMgdW5kZXIgdGhlIEdQTC4gQWZ0ZXIgYWxsLCB0aGUKICAgICAgICBiYXJyZWwgZGlzdG9ydGlvbiBjb2RlIHdhcyB0YWtlbiBmcm9tIHRoZSBDdXJ2YXR1cmUgc2hhZGVyLCB3aGljaCBpcwogICAgICAgIHVuZGVyIHRoZSBHUEwuIgogICAgKQoJVGhpcyBzaGFkZXIgdmFyaWFudCBpcyBwcmUtY29uZmlndXJlZCB3aXRoIHNjcmVlbiBjdXJ2YXR1cmUKKi8KCiNwcmFnbWEgcGFyYW1ldGVyIENSVGdhbW1hICJDUlRHZW9tIFRhcmdldCBHYW1tYSIgMi40IDAuMSA1LjAgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIElOViAiSW52ZXJzZSBHYW1tYS9DUlQtR2VvbSBHYW1tYSBvdXQiIDEuMCAwLjAgMS4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBtb25pdG9yZ2FtbWEgIkNSVEdlb20gTW9uaXRvciBHYW1tYSIgMi4yIDAuMSA1LjAgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIGQgIkNSVEdlb20gRGlzdGFuY2UiIDEuNiAwLjEgMy4wIDAuMQojcHJhZ21hIHBhcmFtZXRlciBDVVJWQVRVUkUgIkNSVEdlb20gQ3VydmF0dXJlIFRvZ2dsZSIgMS4wIDAuMCAxLjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIFIgIkNSVEdlb20gQ3VydmF0dXJlIFJhZGl1cyIgMi4wIDAuMSAxMC4wIDAuMQojcHJhZ21hIHBhcmFtZXRlciBjb3JuZXJzaXplICJDUlRHZW9tIENvcm5lciBTaXplIiAwLjAzIDAuMDAxIDEuMCAwLjAwNQojcHJhZ21hIHBhcmFtZXRlciBjb3JuZXJzbW9vdGggIkNSVEdlb20gQ29ybmVyIFNtb290aG5lc3MiIDEwMDAuMCA4MC4wIDIwMDAuMCAxMDAuMAojcHJhZ21hIHBhcmFtZXRlciB4X3RpbHQgIkNSVEdlb20gSG9yaXpvbnRhbCBUaWx0IiAwLjAgLTAuNSAwLjUgMC4wNQojcHJhZ21hIHBhcmFtZXRlciB5X3RpbHQgIkNSVEdlb20gVmVydGljYWwgVGlsdCIgMC4wIC0wLjUgMC41IDAuMDUKI3ByYWdtYSBwYXJhbWV0ZXIgb3ZlcnNjYW5feCAiQ1JUR2VvbSBIb3Jpei4gT3ZlcnNjYW4gJSIgMTAwLjAgLTEyNS4wIDEyNS4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBvdmVyc2Nhbl95ICJDUlRHZW9tIFZlcnQuIE92ZXJzY2FuICUiIDEwMC4wIC0xMjUuMCAxMjUuMCAxLjAKI3ByYWdtYSBwYXJhbWV0ZXIgRE9UTUFTSyAiQ1JUR2VvbSBEb3QgTWFzayBTdHJlbmd0aCIgMC4zIDAuMCAxLjAgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIFNIQVJQRVIgIkNSVEdlb20gU2hhcnBuZXNzIiAxLjAgMS4wIDMuMCAxLjAKI3ByYWdtYSBwYXJhbWV0ZXIgc2NhbmxpbmVfd2VpZ2h0ICJDUlRHZW9tIFNjYW5saW5lIFdlaWdodCIgMC4zIDAuMSAwLjUgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBsdW0gIkNSVEdlb20gTHVtaW5hbmNlIiAwLjAgMC4wIDEuMCAwLjAxCiNwcmFnbWEgcGFyYW1ldGVyIGludGVybGFjZV9kZXRlY3QgIkNSVEdlb20gSW50ZXJsYWNpbmcgU2ltdWxhdGlvbiIgMS4wIDAuMCAxLjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIFNBVFVSQVRJT04gIkNSVEdlb20gU2F0dXJhdGlvbiIgMS4wIDAuMCAyLjAgMC4wNQoKI2lmbmRlZiBQQVJBTUVURVJfVU5JRk9STQojZGVmaW5lIENSVGdhbW1hIDIuNAojZGVmaW5lIG1vbml0b3JnYW1tYSAyLjIKI2RlZmluZSBkIDEuNgojZGVmaW5lIENVUlZBVFVSRSAxLjAKI2RlZmluZSBSIDIuMAojZGVmaW5lIGNvcm5lcnNpemUgMC4wMwojZGVmaW5lIGNvcm5lcnNtb290aCAxMDAwLjAKI2RlZmluZSB4X3RpbHQgMC4wCiNkZWZpbmUgeV90aWx0IDAuMAojZGVmaW5lIG92ZXJzY2FuX3ggMTAwLjAKI2RlZmluZSBvdmVyc2Nhbl95IDEwMC4wCiNkZWZpbmUgRE9UTUFTSyAwLjMKI2RlZmluZSBTSEFSUEVSIDEuMAojZGVmaW5lIHNjYW5saW5lX3dlaWdodCAwLjMKI2RlZmluZSBsdW0gMC4wCiNkZWZpbmUgaW50ZXJsYWNlX2RldGVjdCAxLjAKI2RlZmluZSBTQVRVUkFUSU9OIDEuMAojZGVmaW5lIElOViAxLjAKI2VuZGlmCgojaWYgZGVmaW5lZChWRVJURVgpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgb3V0CiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBpbgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nIAojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgYXR0cmlidXRlIAojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgpDT01QQVRfQVRUUklCVVRFIHZlYzQgVmVydGV4Q29vcmQ7CkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBDT0xPUjsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IFRleENvb3JkOwpDT01QQVRfVkFSWUlORyB2ZWM0IENPTDA7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKCnZlYzQgX29Qb3NpdGlvbjE7IAp1bmlmb3JtIG1hdDQgTVZQTWF0cml4Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7CgpDT01QQVRfVkFSWUlORyB2ZWMyIG92ZXJzY2FuOwpDT01QQVRfVkFSWUlORyB2ZWMyIGFzcGVjdDsKQ09NUEFUX1ZBUllJTkcgdmVjMyBzdHJldGNoOwpDT01QQVRfVkFSWUlORyB2ZWMyIHNpbmFuZ2xlOwpDT01QQVRfVkFSWUlORyB2ZWMyIGNvc2FuZ2xlOwpDT01QQVRfVkFSWUlORyB2ZWMyIG9uZTsKQ09NUEFUX1ZBUllJTkcgZmxvYXQgbW9kX2ZhY3RvcjsKQ09NUEFUX1ZBUllJTkcgdmVjMiBpbGZhYzsKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQ1JUZ2FtbWE7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBtb25pdG9yZ2FtbWE7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBkOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQ1VSVkFUVVJFOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgUjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IGNvcm5lcnNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBjb3JuZXJzbW9vdGg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB4X3RpbHQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB5X3RpbHQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBvdmVyc2Nhbl94Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgb3ZlcnNjYW5feTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IERPVE1BU0s7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBTSEFSUEVSOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgc2NhbmxpbmVfd2VpZ2h0Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgbHVtOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgaW50ZXJsYWNlX2RldGVjdDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IFNBVFVSQVRJT047CiNlbmRpZgoKI2RlZmluZSBGSVgoYykgbWF4KGFicyhjKSwgMWUtNSk7CgpmbG9hdCBpbnRlcnNlY3QodmVjMiB4eSkKICAgICAgICB7CglmbG9hdCBBID0gZG90KHh5LHh5KStkKmQ7CglmbG9hdCBCID0gMi4wKihSKihkb3QoeHksc2luYW5nbGUpLWQqY29zYW5nbGUueCpjb3NhbmdsZS55KS1kKmQpOwoJZmxvYXQgQyA9IGQqZCArIDIuMCpSKmQqY29zYW5nbGUueCpjb3NhbmdsZS55OwoJcmV0dXJuICgtQi1zcXJ0KEIqQi00LjAqQSpDKSkvKDIuMCpBKTsKICAgICAgICB9Cgp2ZWMyIGJrd3RyYW5zKHZlYzIgeHkpCiAgICAgICAgewoJZmxvYXQgYyA9IGludGVyc2VjdCh4eSk7Cgl2ZWMyIHBvaW50ID0gdmVjMihjKSp4eTsKCXBvaW50IC09IHZlYzIoLVIpKnNpbmFuZ2xlOwoJcG9pbnQgLz0gdmVjMihSKTsKCXZlYzIgdGFuZyA9IHNpbmFuZ2xlL2Nvc2FuZ2xlOwoJdmVjMiBwb2MgPSBwb2ludC9jb3NhbmdsZTsKCWZsb2F0IEEgPSBkb3QodGFuZyx0YW5nKSsxLjA7CglmbG9hdCBCID0gLTIuMCpkb3QocG9jLHRhbmcpOwoJZmxvYXQgQyA9IGRvdChwb2MscG9jKS0xLjA7CglmbG9hdCBhID0gKC1CK3NxcnQoQipCLTQuMCpBKkMpKS8oMi4wKkEpOwoJdmVjMiB1diA9IChwb2ludC1hKnNpbmFuZ2xlKS9jb3NhbmdsZTsKCWZsb2F0IHIgPSBSKmFjb3MoYSk7CglyZXR1cm4gdXYqci9zaW4oci9SKTsKICAgICAgICB9Cgp2ZWMyIGZ3dHJhbnModmVjMiB1dikKICAgICAgICB7CglmbG9hdCByID0gRklYKHNxcnQoZG90KHV2LHV2KSkpOwoJdXYgKj0gc2luKHIvUikvcjsKCWZsb2F0IHggPSAxLjAtY29zKHIvUik7CglmbG9hdCBEID0gZC9SICsgeCpjb3NhbmdsZS54KmNvc2FuZ2xlLnkrZG90KHV2LHNpbmFuZ2xlKTsKCXJldHVybiBkKih1dipjb3NhbmdsZS14KnNpbmFuZ2xlKS9EOwogICAgICAgIH0KCnZlYzMgbWF4c2NhbGUoKQogICAgICAgIHsKCXZlYzIgYyA9IGJrd3RyYW5zKC1SICogc2luYW5nbGUgLyAoMS4wICsgUi9kKmNvc2FuZ2xlLngqY29zYW5nbGUueSkpOwoJdmVjMiBhID0gdmVjMigwLjUsMC41KSphc3BlY3Q7Cgl2ZWMyIGxvID0gdmVjMihmd3RyYW5zKHZlYzIoLWEueCxjLnkpKS54LCBmd3RyYW5zKHZlYzIoYy54LC1hLnkpKS55KS9hc3BlY3Q7Cgl2ZWMyIGhpID0gdmVjMihmd3RyYW5zKHZlYzIoK2EueCxjLnkpKS54LCBmd3RyYW5zKHZlYzIoYy54LCthLnkpKS55KS9hc3BlY3Q7CglyZXR1cm4gdmVjMygoaGkrbG8pKmFzcGVjdCowLjUsbWF4KGhpLngtbG8ueCxoaS55LWxvLnkpKTsKICAgICAgICB9Cgp2b2lkIG1haW4oKQp7Ci8vIFNUQVJUIG9mIHBhcmFtZXRlcnMKCi8vIGdhbW1hIG9mIHNpbXVsYXRlZCBDUlQKLy8JQ1JUZ2FtbWEgPSAxLjg7Ci8vIGdhbW1hIG9mIGRpc3BsYXkgbW9uaXRvciAodHlwaWNhbGx5IDIuMiBpcyBjb3JyZWN0KQovLwltb25pdG9yZ2FtbWEgPSAyLjI7Ci8vIG92ZXJzY2FuIChlLmcuIDEuMDIgZm9yIDIlIG92ZXJzY2FuKQoJb3ZlcnNjYW4gPSB2ZWMyKDEuMDAsMS4wMCk7Ci8vIGFzcGVjdCByYXRpbwoJYXNwZWN0ID0gdmVjMigxLjAsIDAuNzUpOwovLyBsZW5ndGhzIGFyZSBtZWFzdXJlZCBpbiB1bml0cyBvZiAoYXBwcm94aW1hdGVseSkgdGhlIHdpZHRoCi8vIG9mIHRoZSBtb25pdG9yIHNpbXVsYXRlZCBkaXN0YW5jZSBmcm9tIHZpZXdlciB0byBtb25pdG9yCi8vCWQgPSAyLjA7Ci8vIHJhZGl1cyBvZiBjdXJ2YXR1cmUKLy8JUiA9IDEuNTsKLy8gdGlsdCBhbmdsZSBpbiByYWRpYW5zCi8vIChiZWhhdmlvciBtaWdodCBiZSBhIGJpdCB3cm9uZyBpZiBib3RoIGNvbXBvbmVudHMgYXJlCi8vIG5vbnplcm8pCgljb25zdCB2ZWMyIGFuZ2xlID0gdmVjMigwLjAsMC4wKTsKLy8gc2l6ZSBvZiBjdXJ2ZWQgY29ybmVycwovLwljb3JuZXJzaXplID0gMC4wMzsKLy8gYm9yZGVyIHNtb290aG5lc3MgcGFyYW1ldGVyCi8vIGRlY3JlYXNlIGlmIGJvcmRlcnMgYXJlIHRvbyBhbGlhc2VkCi8vCWNvcm5lcnNtb290aCA9IDEwMDAuMDsKCi8vIEVORCBvZiBwYXJhbWV0ZXJzCgogICAgdmVjNCBfb0NvbG9yOwogICAgdmVjMiBfb3RleENvb3JkOwogICAgZ2xfUG9zaXRpb24gPSBWZXJ0ZXhDb29yZC54ICogTVZQTWF0cml4WzBdICsgVmVydGV4Q29vcmQueSAqIE1WUE1hdHJpeFsxXSArIFZlcnRleENvb3JkLnogKiBNVlBNYXRyaXhbMl0gKyBWZXJ0ZXhDb29yZC53ICogTVZQTWF0cml4WzNdOwogICAgX29Qb3NpdGlvbjEgPSBnbF9Qb3NpdGlvbjsKICAgIF9vQ29sb3IgPSBDT0xPUjsKICAgIF9vdGV4Q29vcmQgPSBUZXhDb29yZC54eSoxLjAwMDE7CiAgICBDT0wwID0gQ09MT1I7CiAgICBURVgwLnh5ID0gVGV4Q29vcmQueHkqMS4wMDAxOwoKLy8gUHJlY2FsY3VsYXRlIGEgYnVuY2ggb2YgdXNlZnVsIHZhbHVlcyB3ZSdsbCBuZWVkIGluIHRoZSBmcmFnbWVudAovLyBzaGFkZXIuCglzaW5hbmdsZSA9IHNpbih2ZWMyKHhfdGlsdCwgeV90aWx0KSkgKyB2ZWMyKDAuMDAxKTsvL3Npbih2ZWMyKG1heChhYnMoeF90aWx0KSwgMWUtMyksIG1heChhYnMoeV90aWx0KSwgMWUtMykpKTsKCWNvc2FuZ2xlID0gY29zKHZlYzIoeF90aWx0LCB5X3RpbHQpKSArIHZlYzIoMC4wMDEpOy8vY29zKHZlYzIobWF4KGFicyh4X3RpbHQpLCAxZS0zKSwgbWF4KGFicyh5X3RpbHQpLCAxZS0zKSkpOwoJc3RyZXRjaCA9IG1heHNjYWxlKCk7CgoJaWxmYWMgPSB2ZWMyKDEuMCxjbGFtcChmbG9vcihJbnB1dFNpemUueS8yMDAuMCksIDEuMCwgMi4wKSk7CgovLyBUaGUgc2l6ZSBvZiBvbmUgdGV4ZWwsIGluIHRleHR1cmUtY29vcmRpbmF0ZXMuCgl2ZWMyIHNoYXJwVGV4dHVyZVNpemUgPSB2ZWMyKFNIQVJQRVIgKiBUZXh0dXJlU2l6ZS54LCBUZXh0dXJlU2l6ZS55KTsKCW9uZSA9IGlsZmFjIC8gc2hhcnBUZXh0dXJlU2l6ZTsKCi8vIFJlc3VsdGluZyBYIHBpeGVsLWNvb3JkaW5hdGUgb2YgdGhlIHBpeGVsIHdlJ3JlIGRyYXdpbmcuCgltb2RfZmFjdG9yID0gVGV4Q29vcmQueCAqIFRleHR1cmVTaXplLnggKiBPdXRwdXRTaXplLnggLyBJbnB1dFNpemUueDsKCn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojaWZkZWYgR0xfRlJBR01FTlRfUFJFQ0lTSU9OX0hJR0gKcHJlY2lzaW9uIGhpZ2hwIGZsb2F0OwojZWxzZQpwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsKI2VuZGlmCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCnN0cnVjdCBvdXRwdXRfZHVtbXkgewogICAgdmVjNCBfY29sb3I7Cn07Cgp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7CnVuaWZvcm0gc2FtcGxlcjJEIFRleHR1cmU7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKCi8vIENvbW1lbnQgdGhlIG5leHQgbGluZSB0byBkaXNhYmxlIGludGVycG9sYXRpb24gaW4gbGluZWFyIGdhbW1hIChhbmQKLy8gZ2FpbiBzcGVlZCkuCgkjZGVmaW5lIExJTkVBUl9QUk9DRVNTSU5HCgovLyBFbmFibGUgc2NyZWVuIGN1cnZhdHVyZS4KLy8gICAgICAgICNkZWZpbmUgQ1VSVkFUVVJFCgovLyBFbmFibGUgM3ggb3ZlcnNhbXBsaW5nIG9mIHRoZSBiZWFtIHByb2ZpbGUKICAgICAgICAjZGVmaW5lIE9WRVJTQU1QTEUKCi8vIFVzZSB0aGUgb2xkZXIsIHB1cmVseSBnYXVzc2lhbiBiZWFtIHByb2ZpbGUKICAgICAgICAvLyNkZWZpbmUgVVNFR0FVU1NJQU4KCi8vIE1hY3Jvcy4KI2RlZmluZSBGSVgoYykgbWF4KGFicyhjKSwgMWUtNSk7CiNkZWZpbmUgUEkgMy4xNDE1OTI2NTM1ODkKCiNpZmRlZiBMSU5FQVJfUFJPQ0VTU0lORwojICAgICAgIGRlZmluZSBURVgyRChjKSBwb3coQ09NUEFUX1RFWFRVUkUoVGV4dHVyZSwgKGMpKSwgdmVjNChDUlRnYW1tYSkpCiNlbHNlCiMgICAgICAgZGVmaW5lIFRFWDJEKGMpIENPTVBBVF9URVhUVVJFKFRleHR1cmUsIChjKSkKI2VuZGlmCgpDT01QQVRfVkFSWUlORyB2ZWMyIG9uZTsKQ09NUEFUX1ZBUllJTkcgZmxvYXQgbW9kX2ZhY3RvcjsKQ09NUEFUX1ZBUllJTkcgdmVjMiBpbGZhYzsKQ09NUEFUX1ZBUllJTkcgdmVjMiBvdmVyc2NhbjsKQ09NUEFUX1ZBUllJTkcgdmVjMiBhc3BlY3Q7CkNPTVBBVF9WQVJZSU5HIHZlYzMgc3RyZXRjaDsKQ09NUEFUX1ZBUllJTkcgdmVjMiBzaW5hbmdsZTsKQ09NUEFUX1ZBUllJTkcgdmVjMiBjb3NhbmdsZTsKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQ1JUZ2FtbWE7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBtb25pdG9yZ2FtbWE7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBkOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQ1VSVkFUVVJFOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgUjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IGNvcm5lcnNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBjb3JuZXJzbW9vdGg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB4X3RpbHQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB5X3RpbHQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBvdmVyc2Nhbl94Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgb3ZlcnNjYW5feTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IERPVE1BU0s7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBTSEFSUEVSOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgc2NhbmxpbmVfd2VpZ2h0Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgbHVtOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgaW50ZXJsYWNlX2RldGVjdDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IFNBVFVSQVRJT047CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBJTlY7CiNlbmRpZgoKZmxvYXQgaW50ZXJzZWN0KHZlYzIgeHkpCiAgICAgICAgewoJZmxvYXQgQSA9IGRvdCh4eSx4eSkrZCpkOwoJZmxvYXQgQiA9IDIuMCooUiooZG90KHh5LHNpbmFuZ2xlKS1kKmNvc2FuZ2xlLngqY29zYW5nbGUueSktZCpkKTsKCWZsb2F0IEMgPSBkKmQgKyAyLjAqUipkKmNvc2FuZ2xlLngqY29zYW5nbGUueTsKCXJldHVybiAoLUItc3FydChCKkItNC4wKkEqQykpLygyLjAqQSk7CiAgICAgICAgfQoKdmVjMiBia3d0cmFucyh2ZWMyIHh5KQogICAgICAgIHsKCWZsb2F0IGMgPSBpbnRlcnNlY3QoeHkpOwoJdmVjMiBwb2ludCA9IHZlYzIoYykqeHk7Cglwb2ludCAtPSB2ZWMyKC1SKSpzaW5hbmdsZTsKCXBvaW50IC89IHZlYzIoUik7Cgl2ZWMyIHRhbmcgPSBzaW5hbmdsZS9jb3NhbmdsZTsKCXZlYzIgcG9jID0gcG9pbnQvY29zYW5nbGU7CglmbG9hdCBBID0gZG90KHRhbmcsdGFuZykrMS4wOwoJZmxvYXQgQiA9IC0yLjAqZG90KHBvYyx0YW5nKTsKCWZsb2F0IEMgPSBkb3QocG9jLHBvYyktMS4wOwoJZmxvYXQgYSA9ICgtQitzcXJ0KEIqQi00LjAqQSpDKSkvKDIuMCpBKTsKCXZlYzIgdXYgPSAocG9pbnQtYSpzaW5hbmdsZSkvY29zYW5nbGU7CglmbG9hdCByID0gRklYKFIqYWNvcyhhKSk7CglyZXR1cm4gdXYqci9zaW4oci9SKTsKICAgICAgICB9Cgp2ZWMyIHRyYW5zZm9ybSh2ZWMyIGNvb3JkKQogICAgICAgIHsKCWNvb3JkICo9IFRleHR1cmVTaXplIC8gSW5wdXRTaXplOwoJY29vcmQgPSAoY29vcmQtdmVjMigwLjUpKSphc3BlY3Qqc3RyZXRjaC56K3N0cmV0Y2gueHk7CglyZXR1cm4gKGJrd3RyYW5zKGNvb3JkKS92ZWMyKG92ZXJzY2FuX3ggLyAxMDAuMCwgb3ZlcnNjYW5feSAvIDEwMC4wKS9hc3BlY3QrdmVjMigwLjUpKSAqIElucHV0U2l6ZSAvIFRleHR1cmVTaXplOwogICAgICAgIH0KCmZsb2F0IGNvcm5lcih2ZWMyIGNvb3JkKQogICAgICAgIHsKCWNvb3JkICo9IFRleHR1cmVTaXplIC8gSW5wdXRTaXplOwoJY29vcmQgPSAoY29vcmQgLSB2ZWMyKDAuNSkpICogdmVjMihvdmVyc2Nhbl94IC8gMTAwLjAsIG92ZXJzY2FuX3kgLyAxMDAuMCkgKyB2ZWMyKDAuNSk7Cgljb29yZCA9IG1pbihjb29yZCwgdmVjMigxLjApLWNvb3JkKSAqIGFzcGVjdDsKCXZlYzIgY2Rpc3QgPSB2ZWMyKGNvcm5lcnNpemUpOwoJY29vcmQgPSAoY2Rpc3QgLSBtaW4oY29vcmQsY2Rpc3QpKTsKCWZsb2F0IGRpc3QgPSBzcXJ0KGRvdChjb29yZCxjb29yZCkpOwoJcmV0dXJuIGNsYW1wKChjZGlzdC54LWRpc3QpKmNvcm5lcnNtb290aCwwLjAsIDEuMCkqMS4wMDAxOwogICAgICAgIH0KCi8vIENhbGN1bGF0ZSB0aGUgaW5mbHVlbmNlIG9mIGEgc2NhbmxpbmUgb24gdGhlIGN1cnJlbnQgcGl4ZWwuCi8vCi8vICdkaXN0YW5jZScgaXMgdGhlIGRpc3RhbmNlIGluIHRleHR1cmUgY29vcmRpbmF0ZXMgZnJvbSB0aGUgY3VycmVudAovLyBwaXhlbCB0byB0aGUgc2NhbmxpbmUgaW4gcXVlc3Rpb24uCi8vICdjb2xvcicgaXMgdGhlIGNvbG91ciBvZiB0aGUgc2NhbmxpbmUgYXQgdGhlIGhvcml6b250YWwgbG9jYXRpb24gb2YKLy8gdGhlIGN1cnJlbnQgcGl4ZWwuCnZlYzQgc2NhbmxpbmVXZWlnaHRzKGZsb2F0IGRpc3RhbmNlLCB2ZWM0IGNvbG9yKQogICAgICAgIHsKCS8vICJ3aWQiIGNvbnRyb2xzIHRoZSB3aWR0aCBvZiB0aGUgc2NhbmxpbmUgYmVhbSwgZm9yIGVhY2ggUkdCCgkvLyBjaGFubmVsIFRoZSAid2VpZ2h0cyIgbGluZXMgYmFzaWNhbGx5IHNwZWNpZnkgdGhlIGZvcm11bGEKCS8vIHRoYXQgZ2l2ZXMgeW91IHRoZSBwcm9maWxlIG9mIHRoZSBiZWFtLCBpLmUuIHRoZSBpbnRlbnNpdHkgYXMKCS8vIGEgZnVuY3Rpb24gb2YgZGlzdGFuY2UgZnJvbSB0aGUgdmVydGljYWwgY2VudGVyIG9mIHRoZQoJLy8gc2NhbmxpbmUuIEluIHRoaXMgY2FzZSwgaXQgaXMgZ2F1c3NpYW4gaWYgd2lkdGg9MiwgYW5kCgkvLyBiZWNvbWVzIG5vbmdhdXNzaWFuIGZvciBsYXJnZXIgd2lkdGhzLiBJZGVhbGx5IHRoaXMgc2hvdWxkCgkvLyBiZSBub3JtYWxpemVkIHNvIHRoYXQgdGhlIGludGVncmFsIGFjcm9zcyB0aGUgYmVhbSBpcwoJLy8gaW5kZXBlbmRlbnQgb2YgaXRzIHdpZHRoLiBUaGF0IGlzLCBmb3IgYSBuYXJyb3dlciBiZWFtCgkvLyAid2VpZ2h0cyIgc2hvdWxkIGhhdmUgYSBoaWdoZXIgcGVhayBhdCB0aGUgY2VudGVyIG9mIHRoZQoJLy8gc2NhbmxpbmUgdGhhbiBmb3IgYSB3aWRlciBiZWFtLgojaWZkZWYgVVNFR0FVU1NJQU4KCXZlYzQgd2lkID0gMC4zICsgMC4xICogcG93KGNvbG9yLCB2ZWM0KDMuMCkpOwoJdmVjNCB3ZWlnaHRzID0gdmVjNChkaXN0YW5jZSAvIHdpZCk7CglyZXR1cm4gKGx1bSArIDAuNCkgKiBleHAoLXdlaWdodHMgKiB3ZWlnaHRzKSAvIHdpZDsKI2Vsc2UKCXZlYzQgd2lkID0gMi4wICsgMi4wICogcG93KGNvbG9yLCB2ZWM0KDQuMCkpOwoJdmVjNCB3ZWlnaHRzID0gdmVjNChkaXN0YW5jZSAvIHNjYW5saW5lX3dlaWdodCk7CglyZXR1cm4gKGx1bSArIDEuNCkgKiBleHAoLXBvdyh3ZWlnaHRzICogaW52ZXJzZXNxcnQoMC41ICogd2lkKSwgd2lkKSkgLyAoMC42ICsgMC4yICogd2lkKTsKI2VuZGlmCiAgICAgICAgfQoKdmVjMyBzYXR1cmF0aW9uICh2ZWMzIHRleHR1cmVDb2xvcikKewogICAgZmxvYXQgbHVtPWxlbmd0aCh0ZXh0dXJlQ29sb3IpKjAuNTc3NTsKCiAgICB2ZWMzIGx1bWluYW5jZVdlaWdodGluZyA9IHZlYzMoMC4zLDAuNiwwLjEpOwogICAgaWYgKGx1bTwwLjUpIGx1bWluYW5jZVdlaWdodGluZy5yZ2I9KGx1bWluYW5jZVdlaWdodGluZy5yZ2IqbHVtaW5hbmNlV2VpZ2h0aW5nLnJnYikrKGx1bWluYW5jZVdlaWdodGluZy5yZ2IqbHVtaW5hbmNlV2VpZ2h0aW5nLnJnYik7CgogICAgZmxvYXQgbHVtaW5hbmNlID0gZG90KHRleHR1cmVDb2xvciwgbHVtaW5hbmNlV2VpZ2h0aW5nKTsKICAgIHZlYzMgZ3JleVNjYWxlQ29sb3IgPSB2ZWMzKGx1bWluYW5jZSk7CgogICAgdmVjMyByZXMgPSB2ZWMzKG1peChncmV5U2NhbGVDb2xvciwgdGV4dHVyZUNvbG9yLCBTQVRVUkFUSU9OKSk7CiAgICByZXR1cm4gcmVzOwp9CgojZGVmaW5lIHB3ciB2ZWMzKDEuMC8oKC0wLjcqKDEuMC1zY2FubGluZV93ZWlnaHQpKzEuMCkqKC0wLjUqRE9UTUFTSysxLjApKS0xLjI1KQoKCi8vIFJldHVybnMgZ2FtbWEgY29ycmVjdGVkIG91dHB1dCwgY29tcGVuc2F0ZWQgZm9yIHNjYW5saW5lK21hc2sgZW1iZWRkZWQgZ2FtbWEKdmVjMyBpbnZfZ2FtbWEodmVjMyBjb2wsIHZlYzMgcG93ZXIpCnsKICAgIHZlYzMgY2lyICA9IGNvbC0xLjA7CiAgICAgICAgIGNpciAqPSBjaXI7CiAgICAgICAgIGNvbCAgPSBtaXgoc3FydChjb2wpLHNxcnQoMS4wLWNpcikscG93ZXIpOwogICAgcmV0dXJuIGNvbDsKfQoKdm9pZCBtYWluKCkKewovLyBIZXJlJ3MgYSBoZWxwZnVsIGRpYWdyYW0gdG8ga2VlcCBpbiBtaW5kIHdoaWxlIHRyeWluZyB0bwovLyB1bmRlcnN0YW5kIHRoZSBjb2RlOgovLwovLyAgfCAgICAgIHwgICAgICB8ICAgICAgfCAgICAgIHwKLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQovLyAgfCAgICAgIHwgICAgICB8ICAgICAgfCAgICAgIHwKLy8gIHwgIDAxICB8ICAxMSAgfCAgMjEgIHwgIDMxICB8IDwtLSBjdXJyZW50IHNjYW5saW5lCi8vICB8ICAgICAgfCBAICAgIHwgICAgICB8ICAgICAgfAovLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi8vICB8ICAgICAgfCAgICAgIHwgICAgICB8ICAgICAgfAovLyAgfCAgMDIgIHwgIDEyICB8ICAyMiAgfCAgMzIgIHwgPC0tIG5leHQgc2NhbmxpbmUKLy8gIHwgICAgICB8ICAgICAgfCAgICAgIHwgICAgICB8Ci8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLy8gIHwgICAgICB8ICAgICAgfCAgICAgIHwgICAgICB8Ci8vCi8vIEVhY2ggY2hhcmFjdGVyLWNlbGwgcmVwcmVzZW50cyBhIHBpeGVsIG9uIHRoZSBvdXRwdXQKLy8gc3VyZmFjZSwgIkAiIHJlcHJlc2VudHMgdGhlIGN1cnJlbnQgcGl4ZWwgKGFsd2F5cyBzb21ld2hlcmUKLy8gaW4gdGhlIGJvdHRvbSBoYWxmIG9mIHRoZSBjdXJyZW50IHNjYW4tbGluZSwgb3IgdGhlIHRvcC1oYWxmCi8vIG9mIHRoZSBuZXh0IHNjYW5saW5lKS4gVGhlIGdyaWQgb2YgbGluZXMgcmVwcmVzZW50cyB0aGUKLy8gZWRnZXMgb2YgdGhlIHRleGVscyBvZiB0aGUgdW5kZXJseWluZyB0ZXh0dXJlLgoKLy8gVGV4dHVyZSBjb29yZGluYXRlcyBvZiB0aGUgdGV4ZWwgY29udGFpbmluZyB0aGUgYWN0aXZlIHBpeGVsLgoJdmVjMiB4eSA9IChDVVJWQVRVUkUgPiAwLjUpID8gdHJhbnNmb3JtKFRFWDAueHkpIDogVEVYMC54eTsKCglmbG9hdCBjdmFsID0gY29ybmVyKHh5KTsKCi8vIE9mIGFsbCB0aGUgcGl4ZWxzIHRoYXQgYXJlIG1hcHBlZCBvbnRvIHRoZSB0ZXhlbCB3ZSBhcmUKLy8gY3VycmVudGx5IHJlbmRlcmluZywgd2hpY2ggcGl4ZWwgYXJlIHdlIGN1cnJlbnRseSByZW5kZXJpbmc/Cgl2ZWMyIGlsdmVjID0gdmVjMigwLjAsaWxmYWMueSAqIGludGVybGFjZV9kZXRlY3QgPiAxLjUgPyBtb2QoZmxvYXQoRnJhbWVDb3VudCksMi4wKSA6IDAuMCk7Cgl2ZWMyIHJhdGlvX3NjYWxlID0gKHh5ICogVGV4dHVyZVNpemUgLSB2ZWMyKDAuNSkgKyBpbHZlYykvaWxmYWM7CiNpZmRlZiBPVkVSU0FNUExFCglmbG9hdCBmaWx0ZXJfID0gSW5wdXRTaXplLnkvT3V0cHV0U2l6ZS55Oy8vZndpZHRoKHJhdGlvX3NjYWxlLnkpOwojZW5kaWYKCXZlYzIgdXZfcmF0aW8gPSBmcmFjdChyYXRpb19zY2FsZSk7CgovLyBTbmFwIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHVuZGVybHlpbmcgdGV4ZWwuCgl4eSA9IChmbG9vcihyYXRpb19zY2FsZSkqaWxmYWMgKyB2ZWMyKDAuNSkgLSBpbHZlYykgLyBUZXh0dXJlU2l6ZTsKCi8vIENhbGN1bGF0ZSBMYW5jem9zIHNjYWxpbmcgY29lZmZpY2llbnRzIGRlc2NyaWJpbmcgdGhlIGVmZmVjdAovLyBvZiB2YXJpb3VzIG5laWdoYm91ciB0ZXhlbHMgaW4gYSBzY2FubGluZSBvbiB0aGUgY3VycmVudAovLyBwaXhlbC4KCXZlYzQgY29lZmZzID0gUEkgKiB2ZWM0KDEuMCArIHV2X3JhdGlvLngsIHV2X3JhdGlvLngsIDEuMCAtIHV2X3JhdGlvLngsIDIuMCAtIHV2X3JhdGlvLngpOwoKLy8gUHJldmVudCBkaXZpc2lvbiBieSB6ZXJvLgoJY29lZmZzID0gRklYKGNvZWZmcyk7CgovLyBMYW5jem9zMiBrZXJuZWwuCgljb2VmZnMgPSAyLjAgKiBzaW4oY29lZmZzKSAqIHNpbihjb2VmZnMgLyAyLjApIC8gKGNvZWZmcyAqIGNvZWZmcyk7CgovLyBOb3JtYWxpemUuCgljb2VmZnMgLz0gZG90KGNvZWZmcywgdmVjNCgxLjApKTsKCi8vIENhbGN1bGF0ZSB0aGUgZWZmZWN0aXZlIGNvbG91ciBvZiB0aGUgY3VycmVudCBhbmQgbmV4dAovLyBzY2FubGluZXMgYXQgdGhlIGhvcml6b250YWwgbG9jYXRpb24gb2YgdGhlIGN1cnJlbnQgcGl4ZWwsCi8vIHVzaW5nIHRoZSBMYW5jem9zIGNvZWZmaWNpZW50cyBhYm92ZS4KCXZlYzQgY29sICA9IGNsYW1wKG1hdDQoCiAgICAgICAgICAgICAgICAgICAgICAgIFRFWDJEKHh5ICsgdmVjMigtb25lLngsIDAuMCkpLAogICAgICAgICAgICAgICAgICAgICAgICBURVgyRCh4eSksCiAgICAgICAgICAgICAgICAgICAgICAgIFRFWDJEKHh5ICsgdmVjMihvbmUueCwgMC4wKSksCiAgICAgICAgICAgICAgICAgICAgICAgIFRFWDJEKHh5ICsgdmVjMigyLjAgKiBvbmUueCwgMC4wKSkpICogY29lZmZzLAogICAgICAgICAgICAgICAgICAgICAgICAwLjAsIDEuMCk7CiAgICAgICAgdmVjNCBjb2wyID0gY2xhbXAobWF0NCgKICAgICAgICAgICAgICAgICAgICAgICAgVEVYMkQoeHkgKyB2ZWMyKC1vbmUueCwgb25lLnkpKSwKICAgICAgICAgICAgICAgICAgICAgICAgVEVYMkQoeHkgKyB2ZWMyKDAuMCwgb25lLnkpKSwKICAgICAgICAgICAgICAgICAgICAgICAgVEVYMkQoeHkgKyBvbmUpLAogICAgICAgICAgICAgICAgICAgICAgICBURVgyRCh4eSArIHZlYzIoMi4wICogb25lLngsIG9uZS55KSkpICogY29lZmZzLAogICAgICAgICAgICAgICAgICAgICAgICAwLjAsIDEuMCk7CgojaWZuZGVmIExJTkVBUl9QUk9DRVNTSU5HCgljb2wgID0gcG93KGNvbCAsIHZlYzQoQ1JUZ2FtbWEpKTsKCWNvbDIgPSBwb3coY29sMiwgdmVjNChDUlRnYW1tYSkpOwojZW5kaWYKCi8vIENhbGN1bGF0ZSB0aGUgaW5mbHVlbmNlIG9mIHRoZSBjdXJyZW50IGFuZCBuZXh0IHNjYW5saW5lcyBvbgovLyB0aGUgY3VycmVudCBwaXhlbC4KCXZlYzQgd2VpZ2h0cyAgPSBzY2FubGluZVdlaWdodHModXZfcmF0aW8ueSwgY29sKTsKCXZlYzQgd2VpZ2h0czIgPSBzY2FubGluZVdlaWdodHMoMS4wIC0gdXZfcmF0aW8ueSwgY29sMik7CiNpZmRlZiBPVkVSU0FNUExFCgl1dl9yYXRpby55ID11dl9yYXRpby55KzEuMC8zLjAqZmlsdGVyXzsKCXdlaWdodHMgPSAod2VpZ2h0cytzY2FubGluZVdlaWdodHModXZfcmF0aW8ueSwgY29sKSkvMy4wOwoJd2VpZ2h0czI9KHdlaWdodHMyK3NjYW5saW5lV2VpZ2h0cyhhYnMoMS4wLXV2X3JhdGlvLnkpLCBjb2wyKSkvMy4wOwoJdXZfcmF0aW8ueSA9dXZfcmF0aW8ueS0yLjAvMy4wKmZpbHRlcl87Cgl3ZWlnaHRzPXdlaWdodHMrc2NhbmxpbmVXZWlnaHRzKGFicyh1dl9yYXRpby55KSwgY29sKS8zLjA7Cgl3ZWlnaHRzMj13ZWlnaHRzMitzY2FubGluZVdlaWdodHMoYWJzKDEuMC11dl9yYXRpby55KSwgY29sMikvMy4wOwojZW5kaWYKCgl2ZWMzIG11bF9yZXMgID0gKGNvbCAqIHdlaWdodHMgKyBjb2wyICogd2VpZ2h0czIpLnJnYiAqIHZlYzMoY3ZhbCk7CgovLyBkb3QtbWFzayBlbXVsYXRpb246Ci8vIE91dHB1dCBwaXhlbHMgYXJlIGFsdGVybmF0ZWx5IHRpbnRlZCBncmVlbiBhbmQgbWFnZW50YS4KdmVjMyBkb3RNYXNrV2VpZ2h0cyA9IG1peCgKCXZlYzMoMS4wLCAxLjAgLSBET1RNQVNLLCAxLjApLAoJdmVjMygxLjAgLSBET1RNQVNLLCAxLjAsIDEuMCAtIERPVE1BU0spLAoJZmxvb3IobW9kKG1vZF9mYWN0b3IsIDIuMCkpCiAgICAgICAgKTsKCgltdWxfcmVzICo9IGRvdE1hc2tXZWlnaHRzOwoKLy8gQ29udmVydCB0aGUgaW1hZ2UgZ2FtbWEgZm9yIGRpc3BsYXkgb24gb3VyIG91dHB1dCBkZXZpY2UuCmlmIChJTlYgPT0gMS4wKXsgbXVsX3JlcyA9IGludl9nYW1tYShtdWxfcmVzLHB3cik7fSAKCWVsc2UgbXVsX3JlcyA9IHBvdyhtdWxfcmVzLCB2ZWMzKDEuMC9tb25pdG9yZ2FtbWEpKTsKICAgICAgICAKICAgICAgICBtdWxfcmVzID0gc2F0dXJhdGlvbihtdWxfcmVzKTsKCgoKLy8gQ29sb3IgdGhlIHRleGVsLgogICAgb3V0cHV0X2R1bW15IF9PVVQ7CiAgICBfT1VULl9jb2xvciA9IHZlYzQobXVsX3JlcywgMS4wKTsKICAgIEZyYWdDb2xvciA9IF9PVVQuX2NvbG9yOwogICAgcmV0dXJuOwp9IAojZW5kaWYK",
                    },
                ],
            },
            "crt-mattias.glslp": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = crt-mattias.glsl\nfilter_linear0 = false" },
                resources: [
                    {
                        name: "crt-mattias.glsl",
                        type: "base64",
                        value:
                            "Ly8gQ1JUIEVtdWxhdGlvbgovLyBieSBNYXR0aWFzCi8vIGh0dHBzOi8vd3d3LnNoYWRlcnRveS5jb20vdmlldy9sc0IzRFYKCiNwcmFnbWEgcGFyYW1ldGVyIENVUlZBVFVSRSAiQ3VydmF0dXJlIiAwLjUgMC4wIDEuMCAwLjA1CiNwcmFnbWEgcGFyYW1ldGVyIFNDQU5TUEVFRCAiU2NhbmxpbmUgQ3Jhd2wgU3BlZWQiIDEuMCAwLjAgMTAuMCAwLjUKCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBvdXQKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcgCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IENPTE9SOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7CkNPTVBBVF9WQVJZSU5HIHZlYzQgQ09MMDsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwovLyBvdXQgdmFyaWFibGVzIGdvIGhlcmUgYXMgQ09NUEFUX1ZBUllJTkcgd2hhdGV2ZXIKCnZlYzQgX29Qb3NpdGlvbjE7IAp1bmlmb3JtIG1hdDQgTVZQTWF0cml4Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7CgovLyBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgdlRleENvb3JkIFRFWDAueHkKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBPdXRTaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCnZvaWQgbWFpbigpCnsKICAgIGdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7CiAgICBURVgwLnh5ID0gVGV4Q29vcmQueHk7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWZkZWYgR0xfRVMKI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdICnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2Vsc2UKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CiNlbmRpZgojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCBDT01QQVRfUFJFQ0lTSU9OIHZlYzQgRnJhZ0NvbG9yOwojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcKI2RlZmluZSBGcmFnQ29sb3IgZ2xfRnJhZ0NvbG9yCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwp1bmlmb3JtIHNhbXBsZXIyRCBUZXh0dXJlOwpDT01QQVRfVkFSWUlORyB2ZWM0IFRFWDA7CgovLyBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgU291cmNlIFRleHR1cmUKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQoKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBPdXRTaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQ1VSVkFUVVJFLCBTQ0FOU1BFRUQ7CiNlbHNlCiNkZWZpbmUgQ1VSVkFUVVJFIDAuNQojZGVmaW5lIFNDQU5TUEVFRCAxLjAKI2VuZGlmCgojZGVmaW5lIGlDaGFubmVsMCBUZXh0dXJlCiNkZWZpbmUgaVRpbWUgKGZsb2F0KEZyYW1lQ291bnQpIC8gNjAuMCkKI2RlZmluZSBpUmVzb2x1dGlvbiBPdXRwdXRTaXplLnh5CiNkZWZpbmUgZnJhZ0Nvb3JkIGdsX0ZyYWdDb29yZC54eQoKdmVjMyBzYW1wbGVfKCBzYW1wbGVyMkQgdGV4LCB2ZWMyIHRjICkKewoJdmVjMyBzID0gcG93KENPTVBBVF9URVhUVVJFKHRleCx0YykucmdiLCB2ZWMzKDIuMikpOwoJcmV0dXJuIHM7Cn0KCnZlYzMgYmx1cihzYW1wbGVyMkQgdGV4LCB2ZWMyIHRjLCBmbG9hdCBvZmZzKQp7Cgl2ZWM0IHhvZmZzID0gb2ZmcyAqIHZlYzQoLTIuMCwgLTEuMCwgMS4wLCAyLjApIC8gKGlSZXNvbHV0aW9uLnggKiBUZXh0dXJlU2l6ZS54IC8gSW5wdXRTaXplLngpOwoJdmVjNCB5b2ZmcyA9IG9mZnMgKiB2ZWM0KC0yLjAsIC0xLjAsIDEuMCwgMi4wKSAvIChpUmVzb2x1dGlvbi55ICogVGV4dHVyZVNpemUueSAvIElucHV0U2l6ZS55KTsKICAgdGMgPSB0YyAqIElucHV0U2l6ZSAvIFRleHR1cmVTaXplOwoJCgl2ZWMzIGNvbG9yID0gdmVjMygwLjAsIDAuMCwgMC4wKTsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy54LCB5b2Zmcy54KSkgKiAwLjAwMzY2OwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKHhvZmZzLnksIHlvZmZzLngpKSAqIDAuMDE0NjU7Cgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoICAgIDAuMCwgeW9mZnMueCkpICogMC4wMjU2NDsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy56LCB5b2Zmcy54KSkgKiAwLjAxNDY1OwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKHhvZmZzLncsIHlvZmZzLngpKSAqIDAuMDAzNjY7CgkKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy54LCB5b2Zmcy55KSkgKiAwLjAxNDY1OwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKHhvZmZzLnksIHlvZmZzLnkpKSAqIDAuMDU4NjE7Cgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoICAgIDAuMCwgeW9mZnMueSkpICogMC4wOTUyNDsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy56LCB5b2Zmcy55KSkgKiAwLjA1ODYxOwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKHhvZmZzLncsIHlvZmZzLnkpKSAqIDAuMDE0NjU7CgkKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy54LCAwLjApKSAqIDAuMDI1NjQ7Cgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoeG9mZnMueSwgMC4wKSkgKiAwLjA5NTI0OwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKCAgICAwLjAsIDAuMCkpICogMC4xNTAxODsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy56LCAwLjApKSAqIDAuMDk1MjQ7Cgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoeG9mZnMudywgMC4wKSkgKiAwLjAyNTY0OwoJCgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoeG9mZnMueCwgeW9mZnMueikpICogMC4wMTQ2NTsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy55LCB5b2Zmcy56KSkgKiAwLjA1ODYxOwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKCAgICAwLjAsIHlvZmZzLnopKSAqIDAuMDk1MjQ7Cgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoeG9mZnMueiwgeW9mZnMueikpICogMC4wNTg2MTsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy53LCB5b2Zmcy56KSkgKiAwLjAxNDY1OwoJCgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoeG9mZnMueCwgeW9mZnMudykpICogMC4wMDM2NjsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy55LCB5b2Zmcy53KSkgKiAwLjAxNDY1OwoJY29sb3IgKz0gc2FtcGxlXyh0ZXgsdGMgKyB2ZWMyKCAgICAwLjAsIHlvZmZzLncpKSAqIDAuMDI1NjQ7Cgljb2xvciArPSBzYW1wbGVfKHRleCx0YyArIHZlYzIoeG9mZnMueiwgeW9mZnMudykpICogMC4wMTQ2NTsKCWNvbG9yICs9IHNhbXBsZV8odGV4LHRjICsgdmVjMih4b2Zmcy53LCB5b2Zmcy53KSkgKiAwLjAwMzY2OwoKCXJldHVybiBjb2xvcjsKfQoKLy9DYW5vbmljYWwgbm9pc2UgZnVuY3Rpb247IHJlcGxhY2VkIHRvIHByZXZlbnQgcHJlY2lzaW9uIGVycm9ycwovL2Zsb2F0IHJhbmQodmVjMiBjbyl7Ci8vICAgIHJldHVybiBmcmFjdChzaW4oZG90KGNvLnh5ICx2ZWMyKDEyLjk4OTgsNzguMjMzKSkpICogNDM3NTguNTQ1Myk7Ci8vfQoKZmxvYXQgcmFuZCh2ZWMyIGNvKQp7CiAgICBmbG9hdCBhID0gMTIuOTg5ODsKICAgIGZsb2F0IGIgPSA3OC4yMzM7CiAgICBmbG9hdCBjID0gNDM3NTguNTQ1MzsKICAgIGZsb2F0IGR0PSBkb3QoY28ueHkgLHZlYzIoYSxiKSk7CiAgICBmbG9hdCBzbj0gbW9kKGR0LDMuMTQpOwogICAgcmV0dXJuIGZyYWN0KHNpbihzbikgKiBjKTsKfQoKdmVjMiBjdXJ2ZSh2ZWMyIHV2KQp7Cgl1diA9ICh1diAtIDAuNSkgKiAyLjA7Cgl1diAqPSAxLjE7CQoJdXYueCAqPSAxLjAgKyBwb3coKGFicyh1di55KSAvIDUuMCksIDIuMCk7Cgl1di55ICo9IDEuMCArIHBvdygoYWJzKHV2LngpIC8gNC4wKSwgMi4wKTsKCXV2ICA9ICh1diAvIDIuMCkgKyAwLjU7Cgl1diA9ICB1diAqMC45MiArIDAuMDQ7CglyZXR1cm4gdXY7Cn0KCnZvaWQgbWFpbigpCnsKICAgIHZlYzIgcSA9ICh2VGV4Q29vcmQueHkgKiBUZXh0dXJlU2l6ZS54eSAvIElucHV0U2l6ZS54eSk7Ly9mcmFnQ29vcmQueHkgLyBpUmVzb2x1dGlvbi54eTsKICAgIHZlYzIgdXYgPSBxOwogICAgdXYgPSBtaXgoIHV2LCBjdXJ2ZSggdXYgKSwgQ1VSVkFUVVJFICkgKiBJbnB1dFNpemUueHkgLyBUZXh0dXJlU2l6ZS54eTsKICAgIHZlYzMgY29sOwoJZmxvYXQgeCA9ICBzaW4oMC4xKmlUaW1lK3V2LnkqMjEuMCkqc2luKDAuMjMqaVRpbWUrdXYueSoyOS4wKSpzaW4oMC4zKzAuMTEqaVRpbWUrdXYueSozMS4wKSowLjAwMTc7CglmbG9hdCBvID0yLjAqbW9kKGZyYWdDb29yZC55LDIuMCkvaVJlc29sdXRpb24ueDsKCXgrPW87CiAgIHV2ID0gdXYgKiBUZXh0dXJlU2l6ZSAvIElucHV0U2l6ZTsKICAgIGNvbC5yID0gMS4wKmJsdXIoaUNoYW5uZWwwLHZlYzIodXYueCswLjAwMDksdXYueSswLjAwMDkpLDEuMikueCswLjAwNTsKICAgIGNvbC5nID0gMS4wKmJsdXIoaUNoYW5uZWwwLHZlYzIodXYueCswLjAwMCx1di55LTAuMDAxNSksMS4yKS55KzAuMDA1OwogICAgY29sLmIgPSAxLjAqYmx1cihpQ2hhbm5lbDAsdmVjMih1di54LTAuMDAxNSx1di55KzAuMDAwKSwxLjIpLnorMC4wMDU7CiAgICBjb2wuciArPSAwLjIqYmx1cihpQ2hhbm5lbDAsdmVjMih1di54KzAuMDAwOSx1di55KzAuMDAwOSksMi4yNSkueC0wLjAwNTsKICAgIGNvbC5nICs9IDAuMipibHVyKGlDaGFubmVsMCx2ZWMyKHV2LngrMC4wMDAsdXYueS0wLjAwMTUpLDEuNzUpLnktMC4wMDU7CiAgICBjb2wuYiArPSAwLjIqYmx1cihpQ2hhbm5lbDAsdmVjMih1di54LTAuMDAxNSx1di55KzAuMDAwKSwxLjI1KS56LTAuMDA1OwogICAgZmxvYXQgZ2hzID0gMC4wNTsKCWNvbC5yICs9IGdocyooMS4wLTAuMjk5KSpibHVyKGlDaGFubmVsMCwwLjc1KnZlYzIoMC4wMSwgLTAuMDI3KSt2ZWMyKHV2LngrMC4wMDEsdXYueSswLjAwMSksNy4wKS54OwogICAgY29sLmcgKz0gZ2hzKigxLjAtMC41ODcpKmJsdXIoaUNoYW5uZWwwLDAuNzUqdmVjMigtMC4wMjIsIC0wLjAyKSt2ZWMyKHV2LngrMC4wMDAsdXYueS0wLjAwMiksNS4wKS55OwogICAgY29sLmIgKz0gZ2hzKigxLjAtMC4xMTQpKmJsdXIoaUNoYW5uZWwwLDAuNzUqdmVjMigtMC4wMiwgLTAuMCkrdmVjMih1di54LTAuMDAyLHV2LnkrMC4wMDApLDMuMCkuejsKICAgIAogICAgCgogICAgY29sID0gY2xhbXAoY29sKjAuNCswLjYqY29sKmNvbCoxLjAsMC4wLDEuMCk7CiAgICBmbG9hdCB2aWcgPSAoMC4wICsgMS4wKjE2LjAqdXYueCp1di55KigxLjAtdXYueCkqKDEuMC11di55KSk7Cgl2aWcgPSBwb3codmlnLDAuMyk7Cgljb2wgKj0gdmVjMyh2aWcpOwoKICAgIGNvbCAqPSB2ZWMzKDAuOTUsMS4wNSwwLjk1KTsKCWNvbCA9IG1peCggY29sLCBjb2wgKiBjb2wsIDAuMykgKiAzLjg7CgoJZmxvYXQgc2NhbnMgPSBjbGFtcCggMC4zNSswLjE1KnNpbigzLjUqKGlUaW1lICogU0NBTlNQRUVEKSt1di55KmlSZXNvbHV0aW9uLnkqMS41KSwgMC4wLCAxLjApOwoJCglmbG9hdCBzID0gcG93KHNjYW5zLDAuOSk7Cgljb2wgPSBjb2wqdmVjMyggcykgOwoKICAgIGNvbCAqPSAxLjArMC4wMDE1KnNpbigzMDAuMCppVGltZSk7CgkKCWNvbCo9MS4wLTAuMTUqdmVjMyhjbGFtcCgobW9kKGZyYWdDb29yZC54K28sIDIuMCktMS4wKSoyLjAsMC4wLDEuMCkpOwoJY29sICo9IHZlYzMoIDEuMCApIC0gMC4yNSp2ZWMzKCByYW5kKCB1diswLjAwMDEqaVRpbWUpLCAgcmFuZCggdXYrMC4wMDAxKmlUaW1lICsgMC4zICksICByYW5kKCB1diswLjAwMDEqaVRpbWUrIDAuNSApICApOwoJY29sID0gcG93KGNvbCwgdmVjMygwLjQ1KSk7CgoJaWYgKHV2LnggPCAwLjAgfHwgdXYueCA+IDEuMCkKCQljb2wgKj0gMC4wOwoJaWYgKHV2LnkgPCAwLjAgfHwgdXYueSA+IDEuMCkKCQljb2wgKj0gMC4wOwoJCgogICAgZmxvYXQgY29tcCA9IHNtb290aHN0ZXAoIDAuMSwgMC45LCBzaW4oaVRpbWUpICk7CgogICAgRnJhZ0NvbG9yID0gdmVjNChjb2wsMS4wKTsKfSAKI2VuZGlmCg==",
                    },
                ],
            },
            "crt-beam": {
                shader: {
                    type: "text",
                    value:
                        'shaders = "1"\nfeedback_pass = "0"\nshader0 = "CRT-Beam.glsl"\nfilter_linear0 = "true"\nwrap_mode0 = "clamp_to_border"\nmipmap_input0 = "false"\nalias0 = ""\nfloat_framebuffer0 = "false"\nsrgb_framebuffer0 = "false"\n\n',
                },
                resources: [
                    {
                        name: "CRT-Beam.glsl",
                        type: "base64",
                        value:
                            "LyoKCWNydC1iZWFtCglmb3IgYmVzdCByZXN1bHRzIHVzZSBpbnRlZ2VyIHNjYWxlIDV4IG9yIG1vcmUKKi8KCiNwcmFnbWEgcGFyYW1ldGVyIGJsdXIgIkhvcml6b250YWwgQmx1ci9CZWFtIHNoYXBlIiAwLjYgMC4wIDEuMCAwLjEKI3ByYWdtYSBwYXJhbWV0ZXIgU2NhbmxpbmUgIlNjYW5saW5lIHRoaWNrbmVzcyIgMC4yIDAuMCAxLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciB3ZWlnaHRyICJTY2FubGluZSBSZWQgYnJpZ2h0bmVzcyIgMC44IDAuMCAxLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciB3ZWlnaHRnICJTY2FubGluZSBHcmVlbiBicmlnaHRuZXNzIiAwLjggMC4wIDEuMCAwLjA1CiNwcmFnbWEgcGFyYW1ldGVyIHdlaWdodGIgIlNjYW5saW5lIEJsdWUgYnJpZ2h0bmVzcyIgMC44IDAuMCAxLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBib2d1c19tc2sgIiBbIE1BU0tTIF0gIiAwLjAgMC4wIDAuMCAwLjAKI3ByYWdtYSBwYXJhbWV0ZXIgbWFzayAiTWFzayAwOkNHV0csMS0yOkxvdHRlcywzLTQgR3JheSw1LTY6Q0dXRyBzbG90LDcgVkdBIiAzLjAgLTEuMCA3LjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIG1za19zaXplICJNYXNrIHNpemUiIDEuMCAxLjAgMi4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBzY2FsZSAiVkdBIE1hc2sgVmVydGljYWwgU2NhbGUiIDIuMCAyLjAwIDEwLjAwIDEuMAojcHJhZ21hIHBhcmFtZXRlciBNYXNrRGFyayAiTG90dGVzIE1hc2sgRGFyayIgMC43IDAuMDAgMi4wMCAwLjEwCiNwcmFnbWEgcGFyYW1ldGVyIE1hc2tMaWdodCAiTG90dGVzIE1hc2sgTGlnaHQiIDEuMCAwLjAwIDIuMDAgMC4xMAojcHJhZ21hIHBhcmFtZXRlciBib2d1c19jb2wgIiBbIENPTE9SIF0gIiAwLjAgMC4wIDAuMCAwLjAKI3ByYWdtYSBwYXJhbWV0ZXIgc2F0ICJTYXR1cmF0aW9uIiAxLjAgMC4wMCAyLjAwIDAuMDUKI3ByYWdtYSBwYXJhbWV0ZXIgYnJpZ2h0ICJCb29zdCBicmlnaHQiIDEuMCAxLjAwIDIuMDAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBkYXJrICJCb29zdCBkYXJrIiAxLjQ1IDEuMDAgMi4wMCAwLjA1CiNwcmFnbWEgcGFyYW1ldGVyIGdsb3cgIkdsb3cgU3RyZW5ndGgiIDAuMDggMC4wIDAuNSAwLjAxCgoKI2RlZmluZSBwaSAzLjE0MTU5CgojaWZkZWYgR0xfRVMKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OIG1lZGl1bXAKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCgp1bmlmb3JtIHZlYzIgVGV4dHVyZVNpemU7CnZhcnlpbmcgdmVjMiBURVgwOwp2YXJ5aW5nIHZlYzIgZnJhZ3BvczsKCiNpZiBkZWZpbmVkKFZFUlRFWCkKdW5pZm9ybSBtYXQ0IE1WUE1hdHJpeDsKYXR0cmlidXRlIHZlYzQgVmVydGV4Q29vcmQ7CmF0dHJpYnV0ZSB2ZWMyIFRleENvb3JkOwp1bmlmb3JtIHZlYzIgSW5wdXRTaXplOwp1bmlmb3JtIHZlYzIgT3V0cHV0U2l6ZTsKCnZvaWQgbWFpbigpCnsKCVRFWDAgPSBUZXhDb29yZCoxLjAwMDE7ICAgICAgICAgICAgICAgICAgICAKCWdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7ICAKCWZyYWdwb3MgPSBURVgwLnh5Kk91dHB1dFNpemUueHkqVGV4dHVyZVNpemUueHkvSW5wdXRTaXplLnh5OyAgIAp9CgojZWxpZiBkZWZpbmVkKEZSQUdNRU5UKQoKdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsKdW5pZm9ybSB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gdmVjMiBJbnB1dFNpemU7CgojZGVmaW5lIHZUZXhDb29yZCBURVgwLnh5CiNkZWZpbmUgU291cmNlU2l6ZSB2ZWM0KFRleHR1cmVTaXplLCAxLjAgLyBUZXh0dXJlU2l6ZSkgLy9laXRoZXIgVGV4dHVyZVNpemUgb3IgSW5wdXRTaXplCiNkZWZpbmUgb3V0U2l6ZSB2ZWM0KE91dHB1dFNpemUueHksIDEuMC9PdXRwdXRTaXplLnh5LzQuMCkKI2RlZmluZSBGcmFnQ29sb3IgZ2xfRnJhZ0NvbG9yCiNkZWZpbmUgU291cmNlIFRleHR1cmUKCgojaWZkZWYgUEFSQU1FVEVSX1VOSUZPUk0KCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBibHVyOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgU2NhbmxpbmU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB3ZWlnaHRyOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgd2VpZ2h0ZzsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IHdlaWdodGI7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBtYXNrOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgc2NhbGU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBtc2tfc2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IE1hc2tEYXJrOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgTWFza0xpZ2h0Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgYnJpZ2h0Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgZGFyazsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IHNhdDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IGdsb3c7CgojZWxzZQoKI2RlZmluZSBibHVyIDAuNgojZGVmaW5lIFNjYW5saW5lIDAuMgojZGVmaW5lIHdlaWdodHIgIDAuMgojZGVmaW5lIHdlaWdodGcgIDAuNgojZGVmaW5lIHdlaWdodGIgIDAuMQojZGVmaW5lIG1hc2sgICAgICA3LjAgICAKI2RlZmluZSBtc2tfc2l6ZSAgMS4wCiNkZWZpbmUgc2NhbGUgICAyLjAKI2RlZmluZSBNYXNrRGFyayAgMC41CiNkZWZpbmUgTWFza0xpZ2h0ICAxLjUKI2RlZmluZSBicmlnaHQgIDEuNQojZGVmaW5lIGRhcmsgIDEuMjUKI2RlZmluZSBnbG93ICAgICAgMC4wNSAgIAojZGVmaW5lIHNhdCAgICAgICAxLjAKCiNlbmRpZgoKdmVjNCBNYXNrICh2ZWMyIHApCnsJCQoJCXAgPSBmbG9vcihwL21za19zaXplKTsKCQlmbG9hdCBtZj1mcmFjdChwLngqMC41KTsKCQlmbG9hdCBtPU1hc2tEYXJrOwoJCXZlYzMgTWFzayA9IHZlYzMgKE1hc2tEYXJrKTsKCi8vIFBob3NwaG9yLgoJaWYgKG1hc2s9PTAuMCkKCXsKCQlpZiAobWYgPCAwLjUpIHJldHVybiB2ZWM0IChNYXNrTGlnaHQsbSxNYXNrTGlnaHQsMS4wKTsgCgkJZWxzZSByZXR1cm4gdmVjNCAobSxNYXNrTGlnaHQsbSwxLjApOwoJfQoKLy8gVmVyeSBjb21wcmVzc2VkIFRWIHN0eWxlIHNoYWRvdyBtYXNrLgoJZWxzZSBpZiAobWFzayA9PSAxLjApCgl7CgkJZmxvYXQgbGluZSA9IE1hc2tMaWdodDsKCQlmbG9hdCBvZGQgID0gMC4wOwoKCQlpZiAoZnJhY3QocC54LzYuMCkgPCAwLjUpCgkJCW9kZCA9IDEuMDsKCQlpZiAoZnJhY3QoKHAueSArIG9kZCkvMi4wKSA8IDAuNSkKCQkJbGluZSA9IE1hc2tEYXJrOwoKCQlwLnggPSBmcmFjdChwLngvMy4wKTsKICAgIAoJCWlmICAgICAgKHAueCA8IDAuMzMzKSBNYXNrLnIgPSBNYXNrTGlnaHQ7CgkJZWxzZSBpZiAocC54IDwgMC42NjYpIE1hc2suZyA9IE1hc2tMaWdodDsKCQllbHNlICAgICAgICAgICAgICAgICAgTWFzay5iID0gTWFza0xpZ2h0OwoJCQoJCU1hc2sqPWxpbmU7CgkJcmV0dXJuIHZlYzQgKE1hc2suciwgTWFzay5nLCBNYXNrLmIsMS4wKTsgIAoJfSAKCi8vIEFwZXJ0dXJlLWdyaWxsZS4KCWVsc2UgaWYgKG1hc2sgPT0gMi4wKQoJewoJCXAueCA9IGZyYWN0KHAueC8zLjApOwoKCQlpZiAgICAgIChwLnggPCAwLjMzMykgTWFzay5yID0gTWFza0xpZ2h0OwoJCWVsc2UgaWYgKHAueCA8IDAuNjY2KSBNYXNrLmcgPSBNYXNrTGlnaHQ7CgkJZWxzZSAgICAgICAgICAgICAgICAgIE1hc2suYiA9IE1hc2tMaWdodDsKCQlyZXR1cm4gdmVjNCAoTWFzay5yLCBNYXNrLmcsIE1hc2suYiwxLjApOyAgCgoJfSAKLy8gZ3JheQoJZWxzZSBpZiAobWFzaz09My4wKQoJewoJCQoJCWlmIChtZiA8IDAuNSkgcmV0dXJuIHZlYzQgKE1hc2tMaWdodCxNYXNrTGlnaHQsTWFza0xpZ2h0LDEuMCk7IAoJCWVsc2UgcmV0dXJuIHZlYzQgKG0sbSxtLDEuMCk7Cgl9Ci8vZ3JheSAzcHgKCWVsc2UgaWYgKG1hc2s9PTQuMCkKCXsKCQlmbG9hdCBtZj1mcmFjdChwLngqMC4zMzMzKTsKCQlpZiAobWYgPCAwLjY2NjYpIHJldHVybiB2ZWM0IChNYXNrTGlnaHQsTWFza0xpZ2h0LE1hc2tMaWdodCwxLjApOyAKCQllbHNlIHJldHVybiB2ZWM0IChtLG0sbSwxLjApOwoJfQovL2Nnd2cgc2xvdAoJZWxzZSBpZiAobWFzayA9PSA1LjApCgl7CgkJZmxvYXQgbGluZSA9IE1hc2tMaWdodDsKCQlmbG9hdCBvZGQgID0gMC4wOwoKCQlpZiAoZnJhY3QocC54LzQuMCkgPCAwLjUpCgkJCW9kZCA9IDEuMDsKCQlpZiAoZnJhY3QoKHAueSArIG9kZCkvMi4wKSA8IDAuNSkKCQkJbGluZSA9IE1hc2tEYXJrOwoKCQlwLnggPSBmcmFjdChwLngvMi4wKTsKICAgIAoJCWlmICAocC54IDwgMC41KSB7TWFzay5yID0gMS4wOyBNYXNrLmIgPSAxLjA7fQoJCWVsc2UgIE1hc2suZyA9IDEuMDsJCgkJTWFzayo9bGluZTsgIAoJCXJldHVybiB2ZWM0IChNYXNrLnIsIE1hc2suZywgTWFzay5iLDEuMCk7ICAKCgl9IAoKLy9jZ3dnIHNsb3QgMTQ0MHAKCWVsc2UgaWYgKG1hc2sgPT0gNi4wKQoJewoJCWZsb2F0IGxpbmUgPSBNYXNrTGlnaHQ7CgkJZmxvYXQgb2RkICA9IDAuMDsKCgkJaWYgKGZyYWN0KHAueC82LjApIDwgMC41KQoJCQlvZGQgPSAxLjA7CgkJaWYgKGZyYWN0KChwLnkgKyBvZGQpLzMuMCkgPCAwLjUpCgkJCWxpbmUgPSBNYXNrRGFyazsKCgkJcC54ID0gZnJhY3QocC54LzIuMCk7CiAgICAKCQlpZiAgKHAueCA8IDAuNSkge01hc2suciA9IE1hc2tMaWdodDsgTWFzay5iID0gTWFza0xpZ2h0O30KCQkJZWxzZSAge01hc2suZyA9IE1hc2tMaWdodDt9CQoJCQoJCU1hc2sqPWxpbmU7IAoJCXJldHVybiB2ZWM0IChNYXNrLnIsIE1hc2suZywgTWFzay5iLDEuMCk7ICAgCgl9IAoKLy9QQyBDUlQgVkdBIHN0eWxlIG1hc2sKCWVsc2UgaWYgKG1hc2sgPT0gNy4wKQoJewoJCWZsb2F0IGxpbmUgPSAxLjA7CgkJcC54ID0gZnJhY3QocC54LzIuMCk7CgoJCWlmIChmcmFjdChwLnkvc2NhbGUpIDwgMC41KQoJCQl7CgkJCQlpZiAgKHAueCA8IDAuNSkge01hc2suciA9IDEuMDsgTWFzay5iID0gMS4wO30KCQkJCWVsc2UgIHtNYXNrLmcgPSAxLjA7fQkKCQkJfQoJCWVsc2UKCQkJewoJCQkJaWYgIChwLnggPCAwLjUpIHtNYXNrLmcgPSAxLjA7fQkKCQkJCWVsc2UgICB7TWFzay5yID0gMS4wOyBNYXNrLmIgPSAxLjA7fQoJfQoJCU1hc2sqPWxpbmU7CgkJcmV0dXJuIHZlYzQgKE1hc2suciwgTWFzay5nLCBNYXNrLmIsMS4wKTsgICAKCgl9IAplbHNlIHJldHVybiB2ZWM0KDEuMCk7Cn0KdmVjMyBib29zdGVyICh2ZWMyIHBvcykKewoJdmVjMiBkeCA9IHZlYzIoU291cmNlU2l6ZS56LDAuMCk7Cgl2ZWMyIGR5ID0gdmVjMigwLjAsU291cmNlU2l6ZS53KTsKCgl2ZWM0IGMwMCA9IHRleHR1cmUyRChTb3VyY2UscG9zKTsKCXZlYzQgYzAxID0gdGV4dHVyZTJEKFNvdXJjZSxwb3MrZHgpOwoJdmVjNCBjMDIgPSB0ZXh0dXJlMkQoU291cmNlLHBvcytkeSk7Cgl2ZWM0IGMwMyA9IHRleHR1cmUyRChTb3VyY2UscG9zK2R4K2R5KTsKCgl2ZWM0IGdsID0gKGMwMCtjMDErYzAyK2MwMykvNC4wOyBnbCAqPWdsOwoJdmVjMyBnbDAgPSBnbC5yZ2I7CglyZXR1cm4gZ2wwKmdsb3c7Cn0KCnZvaWQgbWFpbigpCnsJCgl2ZWMyIHBvcyA9dlRleENvb3JkOwoJdmVjMiBPR0wyUG9zID0gcG9zKlRleHR1cmVTaXplOwoJdmVjMiBjZW50ID0gKGZsb29yKE9HTDJQb3MpKzAuNSkvVGV4dHVyZVNpemU7CglmbG9hdCB4Y29vcmQgPSBtaXgoY2VudC54LHZUZXhDb29yZC54LGJsdXIpOwoJdmVjMiBjb29yZHMgPSB2ZWMyKHhjb29yZCwgY2VudC55KTsKCgl2ZWMzIHJlcz0gdGV4dHVyZTJEKFNvdXJjZSwgY29vcmRzKS5yZ2I7CgoJZmxvYXQgbHVtID0gbWF4KG1heChyZXMucip3ZWlnaHRyLHJlcy5nKndlaWdodGcpLHJlcy5iKndlaWdodGIpOwoJZmxvYXQgZiA9IGZyYWN0KE9HTDJQb3MueSk7CgkKCXJlcyAqPSAxLjAtKGYtMC41KSooZi0wLjUpKjQ1LjAqKFNjYW5saW5lKigxLjAtbHVtKSk7CglyZXMgPSBjbGFtcChyZXMsMC4wLDEuMCk7CgkKCWZsb2F0IGwgPSBkb3QocmVzLHZlYzMoMC4zLDAuNiwwLjEpKTsKCXJlcyA9IG1peCh2ZWMzKGwpLCByZXMsIHNhdCk7CglyZXMgKz0gYm9vc3Rlcihjb29yZHMpOwoJdmVjNCByZXMwID0gdmVjNChyZXMsMS4wKTsgCglyZXMwICo9IE1hc2soZnJhZ3BvcyoxLjAwMDEpOwoJcmVzMCAqPSBtaXgoZGFyayxicmlnaHQsbCk7CgkKCUZyYWdDb2xvciA9IHJlczA7Cn0KI2VuZGlmCg==",
                    },
                ],
            },
            "crt-caligari": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = crt-caligari.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "crt-caligari.glsl",
                        type: "base64",
                        value:
                            "Ly8gUGFyYW1ldGVyIGxpbmVzIGdvIGhlcmU6Ci8vIDAuNSA9IHRoZSBzcG90IHN0YXlzIGluc2lkZSB0aGUgb3JpZ2luYWwgcGl4ZWwKLy8gMS4wID0gdGhlIHNwb3QgYmxlZWRzIHVwIHRvIHRoZSBjZW50ZXIgb2YgbmV4dCBwaXhlbAojcHJhZ21hIHBhcmFtZXRlciBTUE9UX1dJRFRIICJDUlRDYWxpZ2FyaSBTcG90IFdpZHRoIiAwLjkgMC41IDEuNSAwLjA1CiNwcmFnbWEgcGFyYW1ldGVyIFNQT1RfSEVJR0hUICJDUlRDYWxpZ2FyaSBTcG90IEhlaWdodCIgMC42NSAwLjUgMS41IDAuMDUKLy8gVXNlZCB0byBjb3VudGVyYWN0IHRoZSBkZXNhdHVyYXRpb24gZWZmZWN0IG9mIHdlaWdodGluZy4KI3ByYWdtYSBwYXJhbWV0ZXIgQ09MT1JfQk9PU1QgIkNSVENhbGlnYXJpIENvbG9yIEJvb3N0IiAxLjQ1IDEuMCAyLjAgMC4wNQovLyBDb25zdGFudHMgdXNlZCB3aXRoIGdhbW1hIGNvcnJlY3Rpb24uCiNwcmFnbWEgcGFyYW1ldGVyIElucHV0R2FtbWEgIkNSVENhbGlnYXJpIElucHV0IEdhbW1hIiAyLjQgMC4wIDUuMCAwLjEKI3ByYWdtYSBwYXJhbWV0ZXIgT3V0cHV0R2FtbWEgIkNSVENhbGlnYXJpIE91dHB1dCBHYW1tYSIgMi4yIDAuMCA1LjAgMC4xCgojaWYgZGVmaW5lZChWRVJURVgpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgb3V0CiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBpbgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nIAojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgYXR0cmlidXRlIAojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgpDT01QQVRfQVRUUklCVVRFIHZlYzQgVmVydGV4Q29vcmQ7CkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBDT0xPUjsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IFRleENvb3JkOwpDT01QQVRfVkFSWUlORyB2ZWM0IENPTDA7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKQ09NUEFUX1ZBUllJTkcgdmVjMiBvbmV4OwpDT01QQVRfVkFSWUlORyB2ZWMyIG9uZXk7Cgp2ZWM0IF9vUG9zaXRpb24xOyAKdW5pZm9ybSBtYXQ0IE1WUE1hdHJpeDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwoKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKCnZvaWQgbWFpbigpCnsKICAgIGdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7CiAgICBDT0wwID0gQ09MT1I7CiAgICBURVgwLnh5ID0gVGV4Q29vcmQueHk7CiAgIG9uZXggPSB2ZWMyKFNvdXJjZVNpemUueiwgMC4wKTsKICAgb25leSA9IHZlYzIoMC4wLCBTb3VyY2VTaXplLncpOwp9CgojZWxpZiBkZWZpbmVkKEZSQUdNRU5UKQoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQpvdXQgdmVjNCBGcmFnQ29sb3I7CiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZwojZGVmaW5lIEZyYWdDb2xvciBnbF9GcmFnQ29sb3IKI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdICnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2Vsc2UKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CiNlbmRpZgojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7CnVuaWZvcm0gc2FtcGxlcjJEIFRleHR1cmU7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKQ09NUEFUX1ZBUllJTkcgdmVjMiBvbmV4OwpDT01QQVRfVkFSWUlORyB2ZWMyIG9uZXk7CgovLyBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgU291cmNlIFRleHR1cmUKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQoKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBPdXRwdXRTaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQovLyBBbGwgcGFyYW1ldGVyIGZsb2F0cyBuZWVkIHRvIGhhdmUgQ09NUEFUX1BSRUNJU0lPTiBpbiBmcm9udCBvZiB0aGVtCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBTUE9UX1dJRFRIOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgU1BPVF9IRUlHSFQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBDT0xPUl9CT09TVDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IElucHV0R2FtbWE7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBPdXRwdXRHYW1tYTsKI2Vsc2UKI2RlZmluZSBTUE9UX1dJRFRIIDAuOQojZGVmaW5lIFNQT1RfSEVJR0hUIDAuNjUKI2RlZmluZSBDT0xPUl9CT09TVCAxLjQ1CiNkZWZpbmUgSW5wdXRHYW1tYSAyLjQKI2RlZmluZSBPdXRwdXRHYW1tYSAyLjIKI2VuZGlmCgojZGVmaW5lIEdBTU1BX0lOKGNvbG9yKSAgICAgcG93KGNvbG9yLHZlYzQoSW5wdXRHYW1tYSkpCiNkZWZpbmUgR0FNTUFfT1VUKGNvbG9yKSAgICBwb3coY29sb3IsIHZlYzQoMS4wIC8gT3V0cHV0R2FtbWEpKQoKI2RlZmluZSBURVgyRChjb29yZHMpCUdBTU1BX0lOKCBDT01QQVRfVEVYVFVSRShTb3VyY2UsIGNvb3JkcykgKQoKLy8gTWFjcm8gZm9yIHdlaWdodHMgY29tcHV0aW5nCiNkZWZpbmUgV0VJR0hUKHcpIFwKICAgaWYodz4xLjApIHc9MS4wOyBcCncgPSAxLjAgLSB3ICogdzsgXAp3ID0gdyAqIHc7Cgp2b2lkIG1haW4oKQp7CiAgIHZlYzIgY29vcmRzID0gKCB2VGV4Q29vcmQgKiBTb3VyY2VTaXplLnh5ICk7CiAgIHZlYzIgcGl4ZWxfY2VudGVyID0gZmxvb3IoIGNvb3JkcyApICsgdmVjMigwLjUsIDAuNSk7CiAgIHZlYzIgdGV4dHVyZV9jb29yZHMgPSBwaXhlbF9jZW50ZXIgKiBTb3VyY2VTaXplLnp3OwoKICAgdmVjNCBjb2xvciA9IFRFWDJEKCB0ZXh0dXJlX2Nvb3JkcyApOwoKICAgZmxvYXQgZHggPSBjb29yZHMueCAtIHBpeGVsX2NlbnRlci54OwoKICAgZmxvYXQgaF93ZWlnaHRfMDAgPSBkeCAvIFNQT1RfV0lEVEg7CiAgIFdFSUdIVCggaF93ZWlnaHRfMDAgKTsKCiAgIGNvbG9yICo9IHZlYzQoIGhfd2VpZ2h0XzAwLCBoX3dlaWdodF8wMCwgaF93ZWlnaHRfMDAsIGhfd2VpZ2h0XzAwICApOwoKICAgLy8gZ2V0IGNsb3Nlc3QgaG9yaXpvbnRhbCBuZWlnaGJvdXIgdG8gYmxlbmQKICAgdmVjMiBjb29yZHMwMTsKICAgaWYgKGR4PjAuMCkgewogICAgICBjb29yZHMwMSA9IG9uZXg7CiAgICAgIGR4ID0gMS4wIC0gZHg7CiAgIH0gZWxzZSB7CiAgICAgIGNvb3JkczAxID0gLW9uZXg7CiAgICAgIGR4ID0gMS4wICsgZHg7CiAgIH0KICAgdmVjNCBjb2xvck5CID0gVEVYMkQoIHRleHR1cmVfY29vcmRzICsgY29vcmRzMDEgKTsKCiAgIGZsb2F0IGhfd2VpZ2h0XzAxID0gZHggLyBTUE9UX1dJRFRIOwogICBXRUlHSFQoIGhfd2VpZ2h0XzAxICk7CgogICBjb2xvciA9IGNvbG9yICsgY29sb3JOQiAqIHZlYzQoIGhfd2VpZ2h0XzAxICk7CgogICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8KICAgLy8gVmVydGljYWwgQmxlbmRpbmcKICAgZmxvYXQgZHkgPSBjb29yZHMueSAtIHBpeGVsX2NlbnRlci55OwogICBmbG9hdCB2X3dlaWdodF8wMCA9IGR5IC8gU1BPVF9IRUlHSFQ7CiAgIFdFSUdIVCggdl93ZWlnaHRfMDAgKTsKICAgY29sb3IgKj0gdmVjNCggdl93ZWlnaHRfMDAgKTsKCiAgIC8vIGdldCBjbG9zZXN0IHZlcnRpY2FsIG5laWdoYm91ciB0byBibGVuZAogICB2ZWMyIGNvb3JkczEwOwogICBpZiAoZHk+MC4wKSB7CiAgICAgIGNvb3JkczEwID0gb25leTsKICAgICAgZHkgPSAxLjAgLSBkeTsKICAgfSBlbHNlIHsKICAgICAgY29vcmRzMTAgPSAtb25leTsKICAgICAgZHkgPSAxLjAgKyBkeTsKICAgfQogICBjb2xvck5CID0gVEVYMkQoIHRleHR1cmVfY29vcmRzICsgY29vcmRzMTAgKTsKCiAgIGZsb2F0IHZfd2VpZ2h0XzEwID0gZHkgLyBTUE9UX0hFSUdIVDsKICAgV0VJR0hUKCB2X3dlaWdodF8xMCApOwoKICAgY29sb3IgPSBjb2xvciArIGNvbG9yTkIgKiB2ZWM0KCB2X3dlaWdodF8xMCAqIGhfd2VpZ2h0XzAwLCB2X3dlaWdodF8xMCAqIGhfd2VpZ2h0XzAwLCB2X3dlaWdodF8xMCAqIGhfd2VpZ2h0XzAwLCB2X3dlaWdodF8xMCAqIGhfd2VpZ2h0XzAwICk7CgogICBjb2xvck5CID0gVEVYMkQoICB0ZXh0dXJlX2Nvb3JkcyArIGNvb3JkczAxICsgY29vcmRzMTAgKTsKCiAgIGNvbG9yID0gY29sb3IgKyBjb2xvck5CICogdmVjNCggdl93ZWlnaHRfMTAgKiBoX3dlaWdodF8wMSwgdl93ZWlnaHRfMTAgKiBoX3dlaWdodF8wMSwgdl93ZWlnaHRfMTAgKiBoX3dlaWdodF8wMSwgdl93ZWlnaHRfMTAgKiBoX3dlaWdodF8wMSApOwoKICAgY29sb3IgKj0gdmVjNCggQ09MT1JfQk9PU1QgKTsKCiAgIEZyYWdDb2xvciA9IGNsYW1wKCBHQU1NQV9PVVQoY29sb3IpLCAwLjAsIDEuMCApOwp9IAojZW5kaWYK",
                    },
                ],
            },
            "crt-lottes": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = crt-lottes.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "crt-lottes.glsl",
                        type: "base64",
                        value:
                            "Ly8gUGFyYW1ldGVyIGxpbmVzIGdvIGhlcmU6CiNwcmFnbWEgcGFyYW1ldGVyIGhhcmRTY2FuICJoYXJkU2NhbiIgLTguMCAtMjAuMCAwLjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIGhhcmRQaXggImhhcmRQaXgiIC0zLjAgLTIwLjAgMC4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciB3YXJwWCAid2FycFgiIDAuMDMxIDAuMCAwLjEyNSAwLjAxCiNwcmFnbWEgcGFyYW1ldGVyIHdhcnBZICJ3YXJwWSIgMC4wNDEgMC4wIDAuMTI1IDAuMDEKI3ByYWdtYSBwYXJhbWV0ZXIgbWFza0RhcmsgIm1hc2tEYXJrIiAwLjUgMC4wIDIuMCAwLjEKI3ByYWdtYSBwYXJhbWV0ZXIgbWFza0xpZ2h0ICJtYXNrTGlnaHQiIDEuNSAwLjAgMi4wIDAuMQojcHJhZ21hIHBhcmFtZXRlciBzY2FsZUluTGluZWFyR2FtbWEgInNjYWxlSW5MaW5lYXJHYW1tYSIgMS4wIDAuMCAxLjAgMS4wCiNwcmFnbWEgcGFyYW1ldGVyIHNoYWRvd01hc2sgInNoYWRvd01hc2siIDMuMCAwLjAgNC4wIDEuMAojcHJhZ21hIHBhcmFtZXRlciBicmlnaHRCb29zdCAiYnJpZ2h0bmVzcyBib29zdCIgMS4wIDAuMCAyLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBoYXJkQmxvb21QaXggImJsb29tLXggc29mdCIgLTEuNSAtMi4wIC0wLjUgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIGhhcmRCbG9vbVNjYW4gImJsb29tLXkgc29mdCIgLTIuMCAtNC4wIC0xLjAgMC4xCiNwcmFnbWEgcGFyYW1ldGVyIGJsb29tQW1vdW50ICJibG9vbSBhbW1vdW50IiAwLjE1IDAuMCAxLjAgMC4wNQojcHJhZ21hIHBhcmFtZXRlciBzaGFwZSAiZmlsdGVyIGtlcm5lbCBzaGFwZSIgMi4wIDAuMCAxMC4wIDAuMDUKCiNpZiBkZWZpbmVkKFZFUlRFWCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBvdXQKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcgCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTgojZW5kaWYKCkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IENPTE9SOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7CkNPTVBBVF9WQVJZSU5HIHZlYzQgQ09MMDsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwoKdW5pZm9ybSBtYXQ0IE1WUE1hdHJpeDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwoKLy8gdmVydGV4IGNvbXBhdGliaWxpdHkgI2RlZmluZXMKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQojZGVmaW5lIFNvdXJjZVNpemUgdmVjNChUZXh0dXJlU2l6ZSwgMS4wIC8gVGV4dHVyZVNpemUpIC8vZWl0aGVyIFRleHR1cmVTaXplIG9yIElucHV0U2l6ZQojZGVmaW5lIG91dHNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQoKdm9pZCBtYWluKCkKewogICAgZ2xfUG9zaXRpb24gPSBNVlBNYXRyaXggKiBWZXJ0ZXhDb29yZDsKICAgIFRFWDAueHkgPSBUZXhDb29yZC54eTsKfQoKI2VsaWYgZGVmaW5lZChGUkFHTUVOVCkKCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzAKI2RlZmluZSBDT01QQVRfVkFSWUlORyBpbgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUKb3V0IHZlYzQgRnJhZ0NvbG9yOwojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcKI2RlZmluZSBGcmFnQ29sb3IgZ2xfRnJhZ0NvbG9yCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKI2lmZGVmIEdMX0VTCiNpZmRlZiBHTF9GUkFHTUVOVF9QUkVDSVNJT05fSElHSApwcmVjaXNpb24gaGlnaHAgZmxvYXQ7CiNlbHNlCnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OwojZW5kaWYKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OIG1lZGl1bXAKI2Vsc2UKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OCiNlbmRpZgoKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwp1bmlmb3JtIHNhbXBsZXIyRCBUZXh0dXJlOwpDT01QQVRfVkFSWUlORyB2ZWM0IFRFWDA7CgovLyBmcmFnbWVudCBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgU291cmNlIFRleHR1cmUKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQoKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBvdXRzaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQovLyBBbGwgcGFyYW1ldGVyIGZsb2F0cyBuZWVkIHRvIGhhdmUgQ09NUEFUX1BSRUNJU0lPTiBpbiBmcm9udCBvZiB0aGVtCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBoYXJkU2NhbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IGhhcmRQaXg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB3YXJwWDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IHdhcnBZOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgbWFza0Rhcms7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBtYXNrTGlnaHQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBzY2FsZUluTGluZWFyR2FtbWE7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBzaGFkb3dNYXNrOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgYnJpZ2h0Qm9vc3Q7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBoYXJkQmxvb21QaXg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBoYXJkQmxvb21TY2FuOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgYmxvb21BbW91bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBzaGFwZTsKI2Vsc2UKI2RlZmluZSBoYXJkU2NhbiAtOC4wCiNkZWZpbmUgaGFyZFBpeCAtMy4wCiNkZWZpbmUgd2FycFggMC4wMzEKI2RlZmluZSB3YXJwWSAwLjA0MQojZGVmaW5lIG1hc2tEYXJrIDAuNQojZGVmaW5lIG1hc2tMaWdodCAxLjUKI2RlZmluZSBzY2FsZUluTGluZWFyR2FtbWEgMS4wCiNkZWZpbmUgc2hhZG93TWFzayAzLjAKI2RlZmluZSBicmlnaHRCb29zdCAxLjAKI2RlZmluZSBoYXJkQmxvb21QaXggLTEuNQojZGVmaW5lIGhhcmRCbG9vbVNjYW4gLTIuMAojZGVmaW5lIGJsb29tQW1vdW50IDAuMTUKI2RlZmluZSBzaGFwZSAyLjAKI2VuZGlmCgovL1VuY29tbWVudCB0byByZWR1Y2UgaW5zdHJ1Y3Rpb25zIHdpdGggc2ltcGxlciBsaW5lYXJpemF0aW9uCi8vKGZpeGVzIEhEMzAwMCBTYW5keSBCcmlkZ2UgSUdQKQovLyNkZWZpbmUgU0lNUExFX0xJTkVBUl9HQU1NQQojZGVmaW5lIERPX0JMT09NCgovLyAtLS0tLS0tLS0tLS0tIC8vCgovLyBzUkdCIHRvIExpbmVhci4KLy8gQXNzdW1pbmcgdXNpbmcgc1JHQiB0eXBlZCB0ZXh0dXJlcyB0aGlzIHNob3VsZCBub3QgYmUgbmVlZGVkLgojaWZkZWYgU0lNUExFX0xJTkVBUl9HQU1NQQpmbG9hdCBUb0xpbmVhcjEoZmxvYXQgYykKewogICAgcmV0dXJuIGM7Cn0KdmVjMyBUb0xpbmVhcih2ZWMzIGMpCnsKICAgIHJldHVybiBjOwp9CnZlYzMgVG9TcmdiKHZlYzMgYykKewogICAgcmV0dXJuIHBvdyhjLCB2ZWMzKDEuMCAvIDIuMikpOwp9CiNlbHNlCmZsb2F0IFRvTGluZWFyMShmbG9hdCBjKQp7CiAgICBpZiAoc2NhbGVJbkxpbmVhckdhbW1hID09IDAuKSAKICAgICAgICByZXR1cm4gYzsKICAgIAogICAgcmV0dXJuKGM8PTAuMDQwNDUpID8gYy8xMi45MiA6IHBvdygoYyArIDAuMDU1KS8xLjA1NSwgMi40KTsKfQoKdmVjMyBUb0xpbmVhcih2ZWMzIGMpCnsKICAgIGlmIChzY2FsZUluTGluZWFyR2FtbWE9PTAuKSAKICAgICAgICByZXR1cm4gYzsKICAgIAogICAgcmV0dXJuIHZlYzMoVG9MaW5lYXIxKGMuciksIFRvTGluZWFyMShjLmcpLCBUb0xpbmVhcjEoYy5iKSk7Cn0KCi8vIExpbmVhciB0byBzUkdCLgovLyBBc3N1bWluZyB1c2luZyBzUkdCIHR5cGVkIHRleHR1cmVzIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWVkZWQuCmZsb2F0IFRvU3JnYjEoZmxvYXQgYykKewogICAgaWYgKHNjYWxlSW5MaW5lYXJHYW1tYSA9PSAwLikgCiAgICAgICAgcmV0dXJuIGM7CiAgICAKICAgIHJldHVybihjPDAuMDAzMTMwOCA/IGMqMTIuOTIgOiAxLjA1NSpwb3coYywgMC40MTY2NikgLSAwLjA1NSk7Cn0KCnZlYzMgVG9TcmdiKHZlYzMgYykKewogICAgaWYgKHNjYWxlSW5MaW5lYXJHYW1tYSA9PSAwLikgCiAgICAgICAgcmV0dXJuIGM7CiAgICAKICAgIHJldHVybiB2ZWMzKFRvU3JnYjEoYy5yKSwgVG9TcmdiMShjLmcpLCBUb1NyZ2IxKGMuYikpOwp9CiNlbmRpZgoKLy8gTmVhcmVzdCBlbXVsYXRlZCBzYW1wbGUgZ2l2ZW4gZmxvYXRpbmcgcG9pbnQgcG9zaXRpb24gYW5kIHRleGVsIG9mZnNldC4KLy8gQWxzbyB6ZXJvJ3Mgb2ZmIHNjcmVlbi4KdmVjMyBGZXRjaCh2ZWMyIHBvcyx2ZWMyIG9mZil7CiAgcG9zPShmbG9vcihwb3MqU291cmNlU2l6ZS54eStvZmYpK3ZlYzIoMC41LDAuNSkpL1NvdXJjZVNpemUueHk7CiNpZmRlZiBTSU1QTEVfTElORUFSX0dBTU1BCiAgcmV0dXJuIFRvTGluZWFyKGJyaWdodEJvb3N0ICogcG93KENPTVBBVF9URVhUVVJFKFNvdXJjZSxwb3MueHkpLnJnYiwgdmVjMygyLjIpKSk7CiNlbHNlCiAgcmV0dXJuIFRvTGluZWFyKGJyaWdodEJvb3N0ICogQ09NUEFUX1RFWFRVUkUoU291cmNlLHBvcy54eSkucmdiKTsKI2VuZGlmCn0KCi8vIERpc3RhbmNlIGluIGVtdWxhdGVkIHBpeGVscyB0byBuZWFyZXN0IHRleGVsLgp2ZWMyIERpc3QodmVjMiBwb3MpCnsKICAgIHBvcyA9IHBvcypTb3VyY2VTaXplLnh5OwogICAgCiAgICByZXR1cm4gLSgocG9zIC0gZmxvb3IocG9zKSkgLSB2ZWMyKDAuNSkpOwp9CiAgICAKLy8gMUQgR2F1c3NpYW4uCmZsb2F0IEdhdXMoZmxvYXQgcG9zLCBmbG9hdCBzY2FsZSkKewogICAgcmV0dXJuIGV4cDIoc2NhbGUqcG93KGFicyhwb3MpLCBzaGFwZSkpOwp9CgovLyAzLXRhcCBHYXVzc2lhbiBmaWx0ZXIgYWxvbmcgaG9yeiBsaW5lLgp2ZWMzIEhvcnozKHZlYzIgcG9zLCBmbG9hdCBvZmYpCnsKICAgIHZlYzMgYiAgICA9IEZldGNoKHBvcywgdmVjMigtMS4wLCBvZmYpKTsKICAgIHZlYzMgYyAgICA9IEZldGNoKHBvcywgdmVjMiggMC4wLCBvZmYpKTsKICAgIHZlYzMgZCAgICA9IEZldGNoKHBvcywgdmVjMiggMS4wLCBvZmYpKTsKICAgIGZsb2F0IGRzdCA9IERpc3QocG9zKS54OwoKICAgIC8vIENvbnZlcnQgZGlzdGFuY2UgdG8gd2VpZ2h0LgogICAgZmxvYXQgc2NhbGUgPSBoYXJkUGl4OwogICAgZmxvYXQgd2IgPSBHYXVzKGRzdC0xLjAsc2NhbGUpOwogICAgZmxvYXQgd2MgPSBHYXVzKGRzdCswLjAsc2NhbGUpOwogICAgZmxvYXQgd2QgPSBHYXVzKGRzdCsxLjAsc2NhbGUpOwoKICAgIC8vIFJldHVybiBmaWx0ZXJlZCBzYW1wbGUuCiAgICByZXR1cm4gKGIqd2IrYyp3YytkKndkKS8od2Ird2Mrd2QpOwp9CgovLyA1LXRhcCBHYXVzc2lhbiBmaWx0ZXIgYWxvbmcgaG9yeiBsaW5lLgp2ZWMzIEhvcno1KHZlYzIgcG9zLGZsb2F0IG9mZil7CiAgICB2ZWMzIGEgPSBGZXRjaChwb3MsdmVjMigtMi4wLCBvZmYpKTsKICAgIHZlYzMgYiA9IEZldGNoKHBvcyx2ZWMyKC0xLjAsIG9mZikpOwogICAgdmVjMyBjID0gRmV0Y2gocG9zLHZlYzIoIDAuMCwgb2ZmKSk7CiAgICB2ZWMzIGQgPSBGZXRjaChwb3MsdmVjMiggMS4wLCBvZmYpKTsKICAgIHZlYzMgZSA9IEZldGNoKHBvcyx2ZWMyKCAyLjAsIG9mZikpOwogICAgCiAgICBmbG9hdCBkc3QgPSBEaXN0KHBvcykueDsKICAgIC8vIENvbnZlcnQgZGlzdGFuY2UgdG8gd2VpZ2h0LgogICAgZmxvYXQgc2NhbGUgPSBoYXJkUGl4OwogICAgZmxvYXQgd2EgPSBHYXVzKGRzdCAtIDIuMCwgc2NhbGUpOwogICAgZmxvYXQgd2IgPSBHYXVzKGRzdCAtIDEuMCwgc2NhbGUpOwogICAgZmxvYXQgd2MgPSBHYXVzKGRzdCArIDAuMCwgc2NhbGUpOwogICAgZmxvYXQgd2QgPSBHYXVzKGRzdCArIDEuMCwgc2NhbGUpOwogICAgZmxvYXQgd2UgPSBHYXVzKGRzdCArIDIuMCwgc2NhbGUpOwogICAgCiAgICAvLyBSZXR1cm4gZmlsdGVyZWQgc2FtcGxlLgogICAgcmV0dXJuIChhKndhK2Iqd2IrYyp3YytkKndkK2Uqd2UpLyh3YSt3Yit3Yyt3ZCt3ZSk7Cn0KICAKLy8gNy10YXAgR2F1c3NpYW4gZmlsdGVyIGFsb25nIGhvcnogbGluZS4KdmVjMyBIb3J6Nyh2ZWMyIHBvcyxmbG9hdCBvZmYpCnsKICAgIHZlYzMgYSA9IEZldGNoKHBvcywgdmVjMigtMy4wLCBvZmYpKTsKICAgIHZlYzMgYiA9IEZldGNoKHBvcywgdmVjMigtMi4wLCBvZmYpKTsKICAgIHZlYzMgYyA9IEZldGNoKHBvcywgdmVjMigtMS4wLCBvZmYpKTsKICAgIHZlYzMgZCA9IEZldGNoKHBvcywgdmVjMiggMC4wLCBvZmYpKTsKICAgIHZlYzMgZSA9IEZldGNoKHBvcywgdmVjMiggMS4wLCBvZmYpKTsKICAgIHZlYzMgZiA9IEZldGNoKHBvcywgdmVjMiggMi4wLCBvZmYpKTsKICAgIHZlYzMgZyA9IEZldGNoKHBvcywgdmVjMiggMy4wLCBvZmYpKTsKCiAgICBmbG9hdCBkc3QgPSBEaXN0KHBvcykueDsKICAgIC8vIENvbnZlcnQgZGlzdGFuY2UgdG8gd2VpZ2h0LgogICAgZmxvYXQgc2NhbGUgPSBoYXJkQmxvb21QaXg7CiAgICBmbG9hdCB3YSA9IEdhdXMoZHN0IC0gMy4wLCBzY2FsZSk7CiAgICBmbG9hdCB3YiA9IEdhdXMoZHN0IC0gMi4wLCBzY2FsZSk7CiAgICBmbG9hdCB3YyA9IEdhdXMoZHN0IC0gMS4wLCBzY2FsZSk7CiAgICBmbG9hdCB3ZCA9IEdhdXMoZHN0ICsgMC4wLCBzY2FsZSk7CiAgICBmbG9hdCB3ZSA9IEdhdXMoZHN0ICsgMS4wLCBzY2FsZSk7CiAgICBmbG9hdCB3ZiA9IEdhdXMoZHN0ICsgMi4wLCBzY2FsZSk7CiAgICBmbG9hdCB3ZyA9IEdhdXMoZHN0ICsgMy4wLCBzY2FsZSk7CgogICAgLy8gUmV0dXJuIGZpbHRlcmVkIHNhbXBsZS4KICAgIHJldHVybiAoYSp3YStiKndiK2Mqd2MrZCp3ZCtlKndlK2Yqd2YrZyp3ZykvKHdhK3diK3djK3dkK3dlK3dmK3dnKTsKfQogIAovLyBSZXR1cm4gc2NhbmxpbmUgd2VpZ2h0LgpmbG9hdCBTY2FuKHZlYzIgcG9zLCBmbG9hdCBvZmYpCnsKICAgIGZsb2F0IGRzdCA9IERpc3QocG9zKS55OwoKICAgIHJldHVybiBHYXVzKGRzdCArIG9mZiwgaGFyZFNjYW4pOwp9CiAgCi8vIFJldHVybiBzY2FubGluZSB3ZWlnaHQgZm9yIGJsb29tLgpmbG9hdCBCbG9vbVNjYW4odmVjMiBwb3MsIGZsb2F0IG9mZikKewogICAgZmxvYXQgZHN0ID0gRGlzdChwb3MpLnk7CiAgICAKICAgIHJldHVybiBHYXVzKGRzdCArIG9mZiwgaGFyZEJsb29tU2Nhbik7Cn0KCi8vIEFsbG93IG5lYXJlc3QgdGhyZWUgbGluZXMgdG8gZWZmZWN0IHBpeGVsLgp2ZWMzIFRyaSh2ZWMyIHBvcykKewogICAgdmVjMyBhID0gSG9yejMocG9zLC0xLjApOwogICAgdmVjMyBiID0gSG9yejUocG9zLCAwLjApOwogICAgdmVjMyBjID0gSG9yejMocG9zLCAxLjApOwogICAgCiAgICBmbG9hdCB3YSA9IFNjYW4ocG9zLC0xLjApOyAKICAgIGZsb2F0IHdiID0gU2Nhbihwb3MsIDAuMCk7CiAgICBmbG9hdCB3YyA9IFNjYW4ocG9zLCAxLjApOwogICAgCiAgICByZXR1cm4gYSp3YSArIGIqd2IgKyBjKndjOwp9CiAgCi8vIFNtYWxsIGJsb29tLgp2ZWMzIEJsb29tKHZlYzIgcG9zKQp7CiAgICB2ZWMzIGEgPSBIb3J6NShwb3MsLTIuMCk7CiAgICB2ZWMzIGIgPSBIb3J6Nyhwb3MsLTEuMCk7CiAgICB2ZWMzIGMgPSBIb3J6Nyhwb3MsIDAuMCk7CiAgICB2ZWMzIGQgPSBIb3J6Nyhwb3MsIDEuMCk7CiAgICB2ZWMzIGUgPSBIb3J6NShwb3MsIDIuMCk7CgogICAgZmxvYXQgd2EgPSBCbG9vbVNjYW4ocG9zLC0yLjApOwogICAgZmxvYXQgd2IgPSBCbG9vbVNjYW4ocG9zLC0xLjApOyAKICAgIGZsb2F0IHdjID0gQmxvb21TY2FuKHBvcywgMC4wKTsKICAgIGZsb2F0IHdkID0gQmxvb21TY2FuKHBvcywgMS4wKTsKICAgIGZsb2F0IHdlID0gQmxvb21TY2FuKHBvcywgMi4wKTsKCiAgICByZXR1cm4gYSp3YStiKndiK2Mqd2MrZCp3ZCtlKndlOwp9CiAgCi8vIERpc3RvcnRpb24gb2Ygc2NhbmxpbmVzLCBhbmQgZW5kIG9mIHNjcmVlbiBhbHBoYS4KdmVjMiBXYXJwKHZlYzIgcG9zKQp7CiAgICBwb3MgID0gcG9zKjIuMC0xLjA7ICAgIAogICAgcG9zICo9IHZlYzIoMS4wICsgKHBvcy55KnBvcy55KSp3YXJwWCwgMS4wICsgKHBvcy54KnBvcy54KSp3YXJwWSk7CiAgICAKICAgIHJldHVybiBwb3MqMC41ICsgMC41Owp9CiAgCi8vIFNoYWRvdyBtYXNrLgp2ZWMzIE1hc2sodmVjMiBwb3MpCnsKICAgIHZlYzMgbWFzayA9IHZlYzMobWFza0RhcmssIG1hc2tEYXJrLCBtYXNrRGFyayk7CiAgCiAgICAvLyBWZXJ5IGNvbXByZXNzZWQgVFYgc3R5bGUgc2hhZG93IG1hc2suCiAgICBpZiAoc2hhZG93TWFzayA9PSAxLjApIAogICAgewogICAgICAgIGZsb2F0IGxpbmUgPSBtYXNrTGlnaHQ7CiAgICAgICAgZmxvYXQgb2RkID0gMC4wOwogICAgICAgIAogICAgICAgIGlmIChmcmFjdChwb3MueCowLjE2NjY2NjY2NikgPCAwLjUpIG9kZCA9IDEuMDsKICAgICAgICBpZiAoZnJhY3QoKHBvcy55ICsgb2RkKSAqIDAuNSkgPCAwLjUpIGxpbmUgPSBtYXNrRGFyazsgIAogICAgICAgIAogICAgICAgIHBvcy54ID0gZnJhY3QocG9zLngqMC4zMzMzMzMzMzMpOwoKICAgICAgICBpZiAgICAgIChwb3MueCA8IDAuMzMzKSBtYXNrLnIgPSBtYXNrTGlnaHQ7CiAgICAgICAgZWxzZSBpZiAocG9zLnggPCAwLjY2NikgbWFzay5nID0gbWFza0xpZ2h0OwogICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgIG1hc2suYiA9IG1hc2tMaWdodDsKICAgICAgICBtYXNrKj1saW5lOyAgCiAgICB9IAoKICAgIC8vIEFwZXJ0dXJlLWdyaWxsZS4KICAgIGVsc2UgaWYgKHNoYWRvd01hc2sgPT0gMi4wKSAKICAgIHsKICAgICAgICBwb3MueCA9IGZyYWN0KHBvcy54KjAuMzMzMzMzMzMzKTsKCiAgICAgICAgaWYgICAgICAocG9zLnggPCAwLjMzMykgbWFzay5yID0gbWFza0xpZ2h0OwogICAgICAgIGVsc2UgaWYgKHBvcy54IDwgMC42NjYpIG1hc2suZyA9IG1hc2tMaWdodDsKICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICBtYXNrLmIgPSBtYXNrTGlnaHQ7CiAgICB9IAoKICAgIC8vIFN0cmV0Y2hlZCBWR0Egc3R5bGUgc2hhZG93IG1hc2sgKHNhbWUgYXMgcHJpb3Igc2hhZGVycykuCiAgICBlbHNlIGlmIChzaGFkb3dNYXNrID09IDMuMCkgCiAgICB7CiAgICAgICAgcG9zLnggKz0gcG9zLnkqMy4wOwogICAgICAgIHBvcy54ICA9IGZyYWN0KHBvcy54KjAuMTY2NjY2NjY2KTsKCiAgICAgICAgaWYgICAgICAocG9zLnggPCAwLjMzMykgbWFzay5yID0gbWFza0xpZ2h0OwogICAgICAgIGVsc2UgaWYgKHBvcy54IDwgMC42NjYpIG1hc2suZyA9IG1hc2tMaWdodDsKICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICBtYXNrLmIgPSBtYXNrTGlnaHQ7CiAgICB9CgogICAgLy8gVkdBIHN0eWxlIHNoYWRvdyBtYXNrLgogICAgZWxzZSBpZiAoc2hhZG93TWFzayA9PSA0LjApIAogICAgewogICAgICAgIHBvcy54eSAgPSBmbG9vcihwb3MueHkqdmVjMigxLjAsIDAuNSkpOwogICAgICAgIHBvcy54ICArPSBwb3MueSozLjA7CiAgICAgICAgcG9zLnggICA9IGZyYWN0KHBvcy54KjAuMTY2NjY2NjY2KTsKCiAgICAgICAgaWYgICAgICAocG9zLnggPCAwLjMzMykgbWFzay5yID0gbWFza0xpZ2h0OwogICAgICAgIGVsc2UgaWYgKHBvcy54IDwgMC42NjYpIG1hc2suZyA9IG1hc2tMaWdodDsKICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICBtYXNrLmIgPSBtYXNrTGlnaHQ7CiAgICB9CgogICAgcmV0dXJuIG1hc2s7Cn0KCnZvaWQgbWFpbigpCnsKICAgIHZlYzIgcG9zID0gV2FycChURVgwLnh5KihUZXh0dXJlU2l6ZS54eS9JbnB1dFNpemUueHkpKSooSW5wdXRTaXplLnh5L1RleHR1cmVTaXplLnh5KTsKICAgIHZlYzMgb3V0Q29sb3IgPSBUcmkocG9zKTsKCiNpZmRlZiBET19CTE9PTQogICAgLy9BZGQgQmxvb20KICAgIG91dENvbG9yLnJnYiArPSBCbG9vbShwb3MpKmJsb29tQW1vdW50OwojZW5kaWYKCiAgICBpZiAoc2hhZG93TWFzayA+IDAuMCkKICAgICAgICBvdXRDb2xvci5yZ2IgKj0gTWFzayhnbF9GcmFnQ29vcmQueHkgKiAxLjAwMDAwMSk7CiAgICAKI2lmZGVmIEdMX0VTICAgIC8qIFRPRE8vRklYTUUgLSBoYWNreSBjbGFtcCBmaXggKi8KICAgIHZlYzIgYm9yZGVydGVzdCA9IChwb3MpOwogICAgaWYgKCBib3JkZXJ0ZXN0LnggPiAwLjAwMDEgJiYgYm9yZGVydGVzdC54IDwgMC45OTk5ICYmIGJvcmRlcnRlc3QueSA+IDAuMDAwMSAmJiBib3JkZXJ0ZXN0LnkgPCAwLjk5OTkpCiAgICAgICAgb3V0Q29sb3IucmdiID0gb3V0Q29sb3IucmdiOwogICAgZWxzZQogICAgICAgIG91dENvbG9yLnJnYiA9IHZlYzMoMC4wKTsKI2VuZGlmCiAgICBGcmFnQ29sb3IgPSB2ZWM0KFRvU3JnYihvdXRDb2xvci5yZ2IpLCAxLjApOwp9IAojZW5kaWYK",
                    },
                ],
            },
            "crt-zfast": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = zfast_crt.glsl\nfilter_linear0 = true" },
                resources: [
                    {
                        name: "zfast_crt.glsl",
                        type: "base64",
                        value:
                            "Ly9Gb3IgdGVzdGluZyBjb21waWxhdGlvbg0KLy8jZGVmaW5lIEZSQUdNRU5UDQovLyNkZWZpbmUgVkVSVEVYDQoNCi8vVGhpcyBjYW4ndCBiZSBhbiBvcHRpb24gd2l0aG91dCBzbG93aW5nIHRoZSBzaGFkZXIgZG93bg0KLy9Db21tZW50IHRoaXMgb3V0IGZvciBhIGNvYXJzZXIgMyBwaXhlbCBtYXNrLi4ud2hpY2ggaXMgY3VycmVudGx5IGJyb2tlbg0KLy9vbiBTTkVTIENsYXNzaWMgRWRpdGlvbiBkdWUgdG8gTWFsaSA0MDAgZ3B1IHByZWNpc2lvbg0KI2RlZmluZSBGSU5FTUFTSw0KLy9Tb21lIGRyaXZlcnMgZG9uJ3QgcmV0dXJuIGJsYWNrIHdpdGggdGV4dHVyZSBjb29yZGluYXRlcyBvdXQgb2YgYm91bmRzDQovL1NORVMgQ2xhc3NpYyBpcyB0b28gc2xvdyB0byBibGFjayB0aGVzZSBhcmVhcyBvdXQgd2hlbiB1c2luZyBmdWxsc2NyZWVuDQovL292ZXJsYXlzLiAgQnV0IHlvdSBjYW4gdW5jb21tZW50IHRoZSBiZWxvdyB0byBibGFjayB0aGVtIG91dCBpZiBuZWNlc3NhcnkNCi8vI2RlZmluZSBCTEFDS19PVVRfQk9SREVSDQoNCi8vIFBhcmFtZXRlciBsaW5lcyBnbyBoZXJlOg0KI3ByYWdtYSBwYXJhbWV0ZXIgQkxVUlNDQUxFWCAiQmx1ciBBbW91bnQgWC1BeGlzIiAwLjMwIDAuMCAxLjAgMC4wNQ0KI3ByYWdtYSBwYXJhbWV0ZXIgTE9XTFVNU0NBTiAiU2NhbmxpbmUgRGFya25lc3MgLSBMb3ciIDYuMCAwLjAgMTAuMCAwLjUNCiNwcmFnbWEgcGFyYW1ldGVyIEhJTFVNU0NBTiAiU2NhbmxpbmUgRGFya25lc3MgLSBIaWdoIiA4LjAgMC4wIDUwLjAgMS4wDQojcHJhZ21hIHBhcmFtZXRlciBCUklHSFRCT09TVCAiRGFyayBQaXhlbCBCcmlnaHRuZXNzIEJvb3N0IiAxLjI1IDAuNSAxLjUgMC4wNQ0KI3ByYWdtYSBwYXJhbWV0ZXIgTUFTS19EQVJLICJNYXNrIEVmZmVjdCBBbW91bnQiIDAuMjUgMC4wIDEuMCAwLjA1DQojcHJhZ21hIHBhcmFtZXRlciBNQVNLX0ZBREUgIk1hc2svU2NhbmxpbmUgRmFkZSIgMC44IDAuMCAxLjAgMC4wNQ0KDQojaWYgZGVmaW5lZChWRVJURVgpDQoNCiNpZiBfX1ZFUlNJT05fXyA+PSAxMzANCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgb3V0DQojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgaW4NCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQ0KI2Vsc2UNCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZyANCiNkZWZpbmUgQ09NUEFUX0FUVFJJQlVURSBhdHRyaWJ1dGUgDQojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRA0KI2VuZGlmDQoNCiNpZmRlZiBHTF9FUw0KI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OIG1lZGl1bXANCiNlbHNlDQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04NCiNlbmRpZg0KDQpDT01QQVRfQVRUUklCVVRFIHZlYzQgVmVydGV4Q29vcmQ7DQpDT01QQVRfQVRUUklCVVRFIHZlYzQgQ09MT1I7DQpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7DQpDT01QQVRfVkFSWUlORyB2ZWM0IENPTDA7DQpDT01QQVRfVkFSWUlORyB2ZWM0IFRFWDA7DQpDT01QQVRfVkFSWUlORyBmbG9hdCBtYXNrRmFkZTsNCkNPTVBBVF9WQVJZSU5HIHZlYzIgaW52RGltczsNCg0KdmVjNCBfb1Bvc2l0aW9uMTsgDQp1bmlmb3JtIG1hdDQgTVZQTWF0cml4Ow0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7DQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsNCg0KLy8gY29tcGF0aWJpbGl0eSAjZGVmaW5lcw0KI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQ0KI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUNCiNkZWZpbmUgT3V0U2l6ZSB2ZWM0KE91dHB1dFNpemUsIDEuMCAvIE91dHB1dFNpemUpDQoNCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQ0KLy8gQWxsIHBhcmFtZXRlciBmbG9hdHMgbmVlZCB0byBoYXZlIENPTVBBVF9QUkVDSVNJT04gaW4gZnJvbnQgb2YgdGhlbQ0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IEJMVVJTQ0FMRVg7DQovL3VuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBCTFVSU0NBTEVZOw0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IExPV0xVTVNDQU47DQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgSElMVU1TQ0FOOw0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IEJSSUdIVEJPT1NUOw0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IE1BU0tfREFSSzsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBNQVNLX0ZBREU7DQojZWxzZQ0KI2RlZmluZSBCTFVSU0NBTEVYIDAuNDUNCi8vI2RlZmluZSBCTFVSU0NBTEVZIDAuMjANCiNkZWZpbmUgTE9XTFVNU0NBTiA1LjANCiNkZWZpbmUgSElMVU1TQ0FOIDEwLjANCiNkZWZpbmUgQlJJR0hUQk9PU1QgMS4yNQ0KI2RlZmluZSBNQVNLX0RBUksgMC4yNQ0KI2RlZmluZSBNQVNLX0ZBREUgMC44DQojZW5kaWYNCg0Kdm9pZCBtYWluKCkNCnsNCiAgICBnbF9Qb3NpdGlvbiA9IE1WUE1hdHJpeCAqIFZlcnRleENvb3JkOw0KCQ0KCVRFWDAueHkgPSBUZXhDb29yZC54eSoxLjAwMDE7DQoJbWFza0ZhZGUgPSAwLjMzMzMqTUFTS19GQURFOw0KCWludkRpbXMgPSAxLjAvVGV4dHVyZVNpemUueHk7DQp9DQoNCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpDQoNCiNpZmRlZiBHTF9FUw0KI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdIDQpwcmVjaXNpb24gaGlnaHAgZmxvYXQ7DQojZWxzZQ0KcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7DQojZW5kaWYNCiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wDQojZWxzZQ0KI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9ODQojZW5kaWYNCg0KI2lmIF9fVkVSU0lPTl9fID49IDEzMA0KI2RlZmluZSBDT01QQVRfVkFSWUlORyBpbg0KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlDQpvdXQgQ09NUEFUX1BSRUNJU0lPTiB2ZWM0IEZyYWdDb2xvcjsNCiNlbHNlDQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcNCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcg0KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQNCiNlbmRpZg0KDQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOw0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Ow0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOw0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOw0KdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsNCkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsNCkNPTVBBVF9WQVJZSU5HIGZsb2F0IG1hc2tGYWRlOw0KQ09NUEFUX1ZBUllJTkcgdmVjMiBpbnZEaW1zOw0KDQovLyBjb21wYXRpYmlsaXR5ICNkZWZpbmVzDQojZGVmaW5lIFNvdXJjZSBUZXh0dXJlDQojZGVmaW5lIHZUZXhDb29yZCBURVgwLnh5DQojZGVmaW5lIHRleHR1cmUoYywgZCkgQ09NUEFUX1RFWFRVUkUoYywgZCkNCiNkZWZpbmUgU291cmNlU2l6ZSB2ZWM0KFRleHR1cmVTaXplLCAxLjAgLyBUZXh0dXJlU2l6ZSkgLy9laXRoZXIgVGV4dHVyZVNpemUgb3IgSW5wdXRTaXplDQojZGVmaW5lIE91dFNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQ0KDQojaWZkZWYgUEFSQU1FVEVSX1VOSUZPUk0NCi8vIEFsbCBwYXJhbWV0ZXIgZmxvYXRzIG5lZWQgdG8gaGF2ZSBDT01QQVRfUFJFQ0lTSU9OIGluIGZyb250IG9mIHRoZW0NCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBCTFVSU0NBTEVYOw0KLy91bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQkxVUlNDQUxFWTsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBMT1dMVU1TQ0FOOw0KdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGZsb2F0IEhJTFVNU0NBTjsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBCUklHSFRCT09TVDsNCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBNQVNLX0RBUks7DQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgTUFTS19GQURFOw0KI2Vsc2UNCiNkZWZpbmUgQkxVUlNDQUxFWCAwLjQ1DQovLyNkZWZpbmUgQkxVUlNDQUxFWSAwLjIwDQojZGVmaW5lIExPV0xVTVNDQU4gNS4wDQojZGVmaW5lIEhJTFVNU0NBTiAxMC4wDQojZGVmaW5lIEJSSUdIVEJPT1NUIDEuMjUNCiNkZWZpbmUgTUFTS19EQVJLIDAuMjUNCiNkZWZpbmUgTUFTS19GQURFIDAuOA0KI2VuZGlmDQoNCnZvaWQgbWFpbigpDQp7DQoNCgkvL1RoaXMgaXMganVzdCBsaWtlICJRdWlsZXogU2NhbGluZyIgYnV0IHNoYXJwZXINCglDT01QQVRfUFJFQ0lTSU9OIHZlYzIgcCA9IHZUZXhDb29yZCAqIFRleHR1cmVTaXplOw0KCUNPTVBBVF9QUkVDSVNJT04gdmVjMiBpID0gZmxvb3IocCkgKyAwLjUwOw0KCUNPTVBBVF9QUkVDSVNJT04gdmVjMiBmID0gcCAtIGk7DQoJcCA9IChpICsgNC4wKmYqZipmKSppbnZEaW1zOw0KCXAueCA9IG1peCggcC54ICwgdlRleENvb3JkLngsIEJMVVJTQ0FMRVgpOw0KCUNPTVBBVF9QUkVDSVNJT04gZmxvYXQgWSA9IGYueSpmLnk7DQoJQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBZWSA9IFkqWTsNCiNkZWZpbmUgcmF0aW8gU291cmNlU2l6ZS54L0lucHV0U2l6ZS54CQ0KI2lmIGRlZmluZWQoRklORU1BU0spIA0KCUNPTVBBVF9QUkVDSVNJT04gZmxvYXQgd2hpY2htYXNrID0gZmxvb3IodlRleENvb3JkLngqT3V0cHV0U2l6ZS54KnJhdGlvKSotMC41Ow0KCUNPTVBBVF9QUkVDSVNJT04gZmxvYXQgbWFzayA9IDEuMCArIGZsb2F0KGZyYWN0KHdoaWNobWFzaykgPCAwLjUpICogLU1BU0tfREFSSzsNCiNlbHNlDQoJQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCB3aGljaG1hc2sgPSBmbG9vcih2VGV4Q29vcmQueCpPdXRwdXRTaXplLngqcmF0aW8pKi0wLjMzMzM7DQoJQ09NUEFUX1BSRUNJU0lPTiBmbG9hdCBtYXNrID0gMS4wICsgZmxvYXQoZnJhY3Qod2hpY2htYXNrKSA8IDAuMzMzMykgKiAtTUFTS19EQVJLOw0KI2VuZGlmDQoJQ09NUEFUX1BSRUNJU0lPTiB2ZWMzIGNvbG91ciA9IENPTVBBVF9URVhUVVJFKFNvdXJjZSwgcCkucmdiOw0KCQ0KCUNPTVBBVF9QUkVDSVNJT04gZmxvYXQgc2NhbkxpbmVXZWlnaHQgPSAoQlJJR0hUQk9PU1QgLSBMT1dMVU1TQ0FOKihZIC0gMi4wNSpZWSkpOw0KCUNPTVBBVF9QUkVDSVNJT04gZmxvYXQgc2NhbkxpbmVXZWlnaHRCID0gMS4wIC0gSElMVU1TQ0FOKihZWS0yLjgqWVkqWSk7CQ0KCQ0KI2lmIGRlZmluZWQoQkxBQ0tfT1VUX0JPUkRFUikNCgljb2xvdXIucmdiKj1mbG9hdCh0Yy54ID4gMC4wKSpmbG9hdCh0Yy55ID4gMC4wKTsgLy93aHkgZG9lc24ndCB0aGUgZHJpdmVyIGRvIHRoZSByaWdodCB0aGluZz8NCiNlbmRpZg0KDQoJRnJhZ0NvbG9yLnJnYmEgPSB2ZWM0KGNvbG91ci5yZ2IqbWl4KHNjYW5MaW5lV2VpZ2h0Km1hc2ssIHNjYW5MaW5lV2VpZ2h0QiwgZG90KGNvbG91ci5yZ2IsdmVjMyhtYXNrRmFkZSkpKSwxLjApOw0KCQ0KfSANCiNlbmRpZg0K",
                    },
                ],
            },
            "crt-yeetron": {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = yeetron.glsl\nfilter_linear0 = false\n" },
                resources: [
                    {
                        name: "yeetron.glsl",
                        type: "base64",
                        value:
                            "Ly8gcG9ydGVkIGZyb20gUmVTaGFkZQoKI2lmIGRlZmluZWQoVkVSVEVYKQoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIG91dAojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZyAKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGF0dHJpYnV0ZSAKI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OIG1lZGl1bXAKI2Vsc2UKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OCiNlbmRpZgoKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IFZlcnRleENvb3JkOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgQ09MT1I7CkNPTVBBVF9BVFRSSUJVVEUgdmVjNCBUZXhDb29yZDsKQ09NUEFUX1ZBUllJTkcgdmVjNCBDT0wwOwpDT01QQVRfVkFSWUlORyB2ZWM0IFRFWDA7Cgp2ZWM0IF9vUG9zaXRpb24xOyAKdW5pZm9ybSBtYXQ0IE1WUE1hdHJpeDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwoKLy8gY29tcGF0aWJpbGl0eSAjZGVmaW5lcwojZGVmaW5lIHZUZXhDb29yZCBURVgwLnh5CiNkZWZpbmUgU291cmNlU2l6ZSB2ZWM0KFRleHR1cmVTaXplLCAxLjAgLyBUZXh0dXJlU2l6ZSkgLy9laXRoZXIgVGV4dHVyZVNpemUgb3IgSW5wdXRTaXplCiNkZWZpbmUgT3V0U2l6ZSB2ZWM0KE91dHB1dFNpemUsIDEuMCAvIE91dHB1dFNpemUpCgp2b2lkIG1haW4oKQp7CiAgICBnbF9Qb3NpdGlvbiA9IE1WUE1hdHJpeCAqIFZlcnRleENvb3JkOwogICAgVEVYMC54eSA9IFRleENvb3JkLnh5Owp9CgojZWxpZiBkZWZpbmVkKEZSQUdNRU5UKQoKI2lmZGVmIEdMX0VTCiNpZmRlZiBHTF9GUkFHTUVOVF9QUkVDSVNJT05fSElHSApwcmVjaXNpb24gaGlnaHAgZmxvYXQ7CiNlbHNlCnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OwojZW5kaWYKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OIG1lZGl1bXAKI2Vsc2UKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OCiNlbmRpZgoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIGluCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZQpvdXQgQ09NUEFUX1BSRUNJU0lPTiB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKdW5pZm9ybSBzYW1wbGVyMkQgVGV4dHVyZTsKQ09NUEFUX1ZBUllJTkcgdmVjNCBURVgwOwoKLy8gY29tcGF0aWJpbGl0eSAjZGVmaW5lcwojZGVmaW5lIFNvdXJjZSBUZXh0dXJlCiNkZWZpbmUgdlRleENvb3JkIFRFWDAueHkKCiNkZWZpbmUgU291cmNlU2l6ZSB2ZWM0KFRleHR1cmVTaXplLCAxLjAgLyBUZXh0dXJlU2l6ZSkgLy9laXRoZXIgVGV4dHVyZVNpemUgb3IgSW5wdXRTaXplCiNkZWZpbmUgT3V0U2l6ZSB2ZWM0KE91dHB1dFNpemUsIDEuMCAvIE91dHB1dFNpemUpCgp2ZWM0IGNtcCh2ZWM0IHNyYzAsIHZlYzQgc3JjMSwgdmVjNCBzcmMyKSB7CglyZXR1cm4gdmVjNCgKCQlzcmMwLnggPj0gMC4wID8gc3JjMS54IDogc3JjMi54LAoJCXNyYzAueSA+PSAwLjAgPyBzcmMxLnkgOiBzcmMyLnksCgkJc3JjMC56ID49IDAuMCA/IHNyYzEueiA6IHNyYzIueiwKCQlzcmMwLncgPj0gMC4wID8gc3JjMS53IDogc3JjMi53CgkpOwp9CgojZGVmaW5lIHNhdHVyYXRlKGMpIGNsYW1wKGMsIDAuMCwgMS4wKQoKdm9pZCBtYWluKCkKewoJLy9EZWNsYXJlIHBhcmFtZXRlcnMKCS8vcGl4ZWxTaXplCgl2ZWM0IGMwID0gSW5wdXRTaXplLnh5eXk7CgkvL3RleHR1cmVTaXplCgl2ZWM0IGMxID0gU291cmNlU2l6ZTsKCS8vdmlld1NpemUKCXZlYzQgYzIgPSBPdXRTaXplOwogICAKCS8vRGVjbGFyZSBjb25zdGFudHMKCWNvbnN0IHZlYzQgYzMgPSB2ZWM0KDEuNSwgMC44MDAwMDAwMTIsIDEuMjUsIDAuNzUpOwoJY29uc3QgdmVjNCBjNCA9IHZlYzQoNi4yODMxODU0OCwgLTMuMTQxNTkyNzQsIDAuMjUsIC0wLjI1KTsKCWNvbnN0IHZlYzQgYzUgPSB2ZWM0KDEuLCAwLjUsIDcyMC4sIDMuKTsKCWNvbnN0IHZlYzQgYzYgPSB2ZWM0KDAuMTY2NjY2NjcyLCAtMC4zMzMwMDAwMDQsIC0wLjY2NjAwMDAwOSwgMC44OTk5OTk5NzYpOwoJY29uc3QgdmVjNCBjNyA9IHZlYzQoMC44OTk5OTk5NzYsIDEuMTAwMDAwMDIsIDAuLCAwLik7Cgljb25zdCB2ZWM0IGM4ID0gdmVjNCgtMC41LCAtMC4yNSwgMi4sIDAuNSk7CgoJLy9EZWNsYXJlIHJlZ2lzdGVycwoJdmVjNCByMCwgcjEsIHIyLCByMywgcjQsIHI1LCByNiwgcjcsIHI4LCByOTsKCgkvL0NvZGUgc3RhcnRzIGhlcmUKCXZlYzQgdjAgPSB2VGV4Q29vcmQueHl5eTsKCS8vZGNsXzJkIHMwCglyMC54ID0gMS4wIC8gYzAueDsKCXIwLnkgPSAxLjAgLyBjMC55OwoJcjAueHkgPSAocjAgKiBjMSkueHk7CglyMC54eSA9IChyMCAqIHYwKS54eTsKCXIwLnh5ID0gKHIwICogYzIpLnh5OwoJcjAuencgPSBmcmFjdChyMC54eXh5KS56dzsKCXIwLnh5ID0gKC1yMC56d3p3ICsgcjApLnh5OwoJcjAueHkgPSAocjAgKyBjOC53d3d3KS54eTsKCXIwLnggPSByMC55ICogYzUudyArIHIwLng7CglyMC54ID0gcjAueCAqIGM2Lng7CglyMC54ID0gZnJhY3QocjAueCk7CglyMC54eSA9IChyMC54eHh4ICsgYzYueXp6dykueHk7CglyMS55eiA9IChyMC55ID49IDAuMCA/IGM3Lnh4eXcgOiBjNy54eXh3KS55ejsKCXIxLnggPSBjNi53OwoJcjAueHl6ID0gKHIwLnggPj0gMC4wID8gcjEgOiBjNy55eHh3KS54eXo7CglyMS54eSA9IChjMSAqIHYwKS54eTsKCXIwLncgPSByMS55ICogYzgudyArIGM4Lnc7CglyMC53ID0gZnJhY3QocjAudyk7CglyMC53ID0gcjAudyAqIGM0LnggKyBjNC55OwoJcjIueSA9IHNpbihyMC53KTsKCXIxLnp3ID0gKGFicyhyMikueXl5eSArIGM0KS56dzsKCXIxLnogPSBjbGFtcChyMS56LCAwLjAsIDEuMCk7CglyMC53ID0gcjEudyA+PSAwLjAgPyByMS56IDogYzgudzsKCXIyID0gZnJhY3QocjEueHl4eSk7CglyMS54eSA9IChyMSArIC1yMi56d3p3KS54eTsKCXIyID0gcjIgKyBjOC54eHl5OwoJcjEuencgPSAocjEueHl4eSArIGM4Lnd3d3cpLnp3OwoJcjEuencgPSAodjAueHl4eSAqIC1jMS54eXh5ICsgcjEpLnp3OwoJcjEudyA9IHIxLncgKyByMS53OwoJcjEueiA9IHIxLnogKiBjOC53OwoJcjEueiA9IC1hYnMocjEpLnogKyBjMy54OwoJcjMueCA9IG1heChjMy55LCByMS56KTsKCXI0LnggPSBtaW4ocjMueCwgYzMueik7CglyMS56dyA9ICgtYWJzKHIxKS53d3d3ICsgYzMpLnp3OwoJcjEueiA9IGNsYW1wKHIxLnosIDAuMCwgMS4wKTsKCXIxLnogPSByMS53ID49IDAuMCA/IHIxLnogOiBjOC53OwoJcjQueSA9IHIwLncgKyByMS56OwoJcjAudyA9IHIwLncgKiByNC54OwoJcjEueiA9IHIxLnogKiByNC54OwoJcjMueHkgPSAocjQgKiBjNSkueHk7CglyMS53ID0gcjMueSAqIHIzLng7CglyMi56ID0gY21wKHIyLCByMi54eXh5LCBjOC55eXl5KS56OwoJcjMueHkgPSBtYXgoYzgueXl5eSwgLXIyLnp3encpLnh5OwoJcjIueHkgPSAocjIgKyByMykueHk7CglyMS54eSA9IChyMiAqIGM4Lnp6enogKyByMSkueHk7CglyMS54eSA9IChyMSArIGM4Lnd3d3cpLnh5OwoJcjIueCA9IDEuMCAvIGMxLng7CglyMi55ID0gMS4wIC8gYzEueTsKCXIxLnh5ID0gKHIxICogcjIpLnh5OwoJcjIgPSBDT01QQVRfVEVYVFVSRShTb3VyY2UsIHIxLnh5KTsKCXIzLnggPSByMC53ICogcjIueDsKCXIzLnl6ID0gKHIxLnh6d3cgKiByMikueXo7CglGcmFnQ29sb3IudyA9IHIyLnc7CglyMC54eXogPSAocjAgKiByMykueHl6OwoJcjEueiA9IGM1Lno7CglyMC53ID0gcjEueiArIC1jMi55OwoJRnJhZ0NvbG9yLnh5eiA9IChyMC53ID49IDAuMCA/IHIzIDogcjApLnh5ejsKfSAKI2VuZGlmCg==",
                    },
                ],
            },
            bicubic: {
                shader: { type: "text", value: "shaders = 1\n\nshader0 = bicubic.glsl\nfilter_linear0 = false" },
                resources: [
                    {
                        name: "bicubic.glsl",
                        type: "base64",
                        value:
                            "Ly8gRGVmYXVsdCB0byBNaXRjaGVsLU5ldHJhdmFsaSBjb2VmZmljaWVudHMgZm9yIGJlc3QgcHN5Y2hvdmlzdWFsIHJlc3VsdAovLyBiaWN1YmljLXNoYXJwIGlzIEIgPSAwLjEgYW5kIEMgPSAwLjUKLy8gYmljdWJpYy1zaGFycGVyIGlzIEIgPSAwLjAgYW5kIEMgPSAwLjc1CiNwcmFnbWEgcGFyYW1ldGVyIEIgIkJpY3ViaWMgQ29lZmYgQiIgMC4zMyAwLjAgMS4wIDAuMDEKI3ByYWdtYSBwYXJhbWV0ZXIgQyAiQmljdWJpYyBDb2VmZiBDIiAwLjMzIDAuMCAxLjAgMC4wMQoKI2lmIGRlZmluZWQoVkVSVEVYKQoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIG91dAojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZyAKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGF0dHJpYnV0ZSAKI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OIG1lZGl1bXAKI2Vsc2UKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OCiNlbmRpZgoKQ09NUEFUX0FUVFJJQlVURSB2ZWM0IFZlcnRleENvb3JkOwpDT01QQVRfQVRUUklCVVRFIHZlYzQgVGV4Q29vcmQ7CkNPTVBBVF9WQVJZSU5HIHZlYzQgVEVYMDsKCnVuaWZvcm0gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKCi8vIGNvbXBhdGliaWxpdHkgI2RlZmluZXMKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQojZGVmaW5lIFNvdXJjZVNpemUgdmVjNChUZXh0dXJlU2l6ZSwgMS4wIC8gVGV4dHVyZVNpemUpIC8vZWl0aGVyIFRleHR1cmVTaXplIG9yIElucHV0U2l6ZQojZGVmaW5lIE91dFNpemUgdmVjNChPdXRwdXRTaXplLCAxLjAgLyBPdXRwdXRTaXplKQoKdm9pZCBtYWluKCkKewogICBnbF9Qb3NpdGlvbiA9IE1WUE1hdHJpeCAqIFZlcnRleENvb3JkOwogICBURVgwLnh5ID0gVGV4Q29vcmQueHk7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWZkZWYgR0xfRVMKI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdICnByZWNpc2lvbiBoaWdocCBmbG9hdDsKI2Vsc2UKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CiNlbmRpZgojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCBDT01QQVRfUFJFQ0lTSU9OIHZlYzQgRnJhZ0NvbG9yOwojZWxzZQojZGVmaW5lIENPTVBBVF9WQVJZSU5HIHZhcnlpbmcKI2RlZmluZSBGcmFnQ29sb3IgZ2xfRnJhZ0NvbG9yCiNkZWZpbmUgQ09NUEFUX1RFWFRVUkUgdGV4dHVyZTJECiNlbmRpZgoKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZURpcmVjdGlvbjsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIGludCBGcmFtZUNvdW50Owp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBPdXRwdXRTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBUZXh0dXJlU2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgSW5wdXRTaXplOwp1bmlmb3JtIHNhbXBsZXIyRCBUZXh0dXJlOwpDT01QQVRfVkFSWUlORyB2ZWM0IFRFWDA7CgovLyBjb21wYXRpYmlsaXR5ICNkZWZpbmVzCiNkZWZpbmUgU291cmNlIFRleHR1cmUKI2RlZmluZSB2VGV4Q29vcmQgVEVYMC54eQoKI2RlZmluZSBTb3VyY2VTaXplIHZlYzQoVGV4dHVyZVNpemUsIDEuMCAvIFRleHR1cmVTaXplKSAvL2VpdGhlciBUZXh0dXJlU2l6ZSBvciBJbnB1dFNpemUKI2RlZmluZSBPdXRTaXplIHZlYzQoT3V0cHV0U2l6ZSwgMS4wIC8gT3V0cHV0U2l6ZSkKCiNpZmRlZiBQQVJBTUVURVJfVU5JRk9STQp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gZmxvYXQgQiwgQzsKI2Vsc2UKI2RlZmluZSBCIDAuMzMzMwojZGVmaW5lIEMgMC4zMzMzCiNlbmRpZgoKZmxvYXQgd2VpZ2h0KGZsb2F0IHgpCnsKCWZsb2F0IGF4ID0gYWJzKHgpOwoKCWlmIChheCA8IDEuMCkKCXsKCQlyZXR1cm4KCQkJKAoJCQkgcG93KHgsIDIuMCkgKiAoKDEyLjAgLSA5LjAgKiBCIC0gNi4wICogQykgKiBheCArICgtMTguMCArIDEyLjAgKiBCICsgNi4wICogQykpICsKCQkJICg2LjAgLSAyLjAgKiBCKQoJCQkpIC8gNi4wOwoJfQoJZWxzZSBpZiAoKGF4ID49IDEuMCkgJiYgKGF4IDwgMi4wKSkKCXsKCQlyZXR1cm4KCQkJKAoJCQkgcG93KHgsIDIuMCkgKiAoKC1CIC0gNi4wICogQykgKiBheCArICg2LjAgKiBCICsgMzAuMCAqIEMpKSArCgkJCSAoLTEyLjAgKiBCIC0gNDguMCAqIEMpICogYXggKyAoOC4wICogQiArIDI0LjAgKiBDKQoJCQkpIC8gNi4wOwoJfQoJZWxzZQoJewoJCXJldHVybiAwLjA7Cgl9Cn0KCQp2ZWM0IHdlaWdodDQoZmxvYXQgeCkKewoJcmV0dXJuIHZlYzQoCgkJCXdlaWdodCh4IC0gMi4wKSwKCQkJd2VpZ2h0KHggLSAxLjApLAoJCQl3ZWlnaHQoeCksCgkJCXdlaWdodCh4ICsgMS4wKSk7Cn0KCnZlYzMgcGl4ZWwoZmxvYXQgeHBvcywgZmxvYXQgeXBvcywgc2FtcGxlcjJEIHRleCkKewoJcmV0dXJuIENPTVBBVF9URVhUVVJFKHRleCwgdmVjMih4cG9zLCB5cG9zKSkucmdiOwp9Cgp2ZWMzIGxpbmVfcnVuKGZsb2F0IHlwb3MsIHZlYzQgeHBvcywgdmVjNCBsaW5ldGFwcywgc2FtcGxlcjJEIHRleCkKewoJcmV0dXJuCgkJcGl4ZWwoeHBvcy5yLCB5cG9zLCB0ZXgpICogbGluZXRhcHMuciArCgkJcGl4ZWwoeHBvcy5nLCB5cG9zLCB0ZXgpICogbGluZXRhcHMuZyArCgkJcGl4ZWwoeHBvcy5iLCB5cG9zLCB0ZXgpICogbGluZXRhcHMuYiArCgkJcGl4ZWwoeHBvcy5hLCB5cG9zLCB0ZXgpICogbGluZXRhcHMuYTsKfQoKdm9pZCBtYWluKCkKewogICAgICAgIHZlYzIgc3RlcHh5ID0gdmVjMigxLjAvU291cmNlU2l6ZS54LCAxLjAvU291cmNlU2l6ZS55KTsKICAgICAgICB2ZWMyIHBvcyA9IHZUZXhDb29yZC54eSArIHN0ZXB4eSAqIDAuNTsKICAgICAgICB2ZWMyIGYgPSBmcmFjdChwb3MgLyBzdGVweHkpOwoJCQoJdmVjNCBsaW5ldGFwcyAgID0gd2VpZ2h0NCgxLjAgLSBmLngpOwoJdmVjNCBjb2x1bW50YXBzID0gd2VpZ2h0NCgxLjAgLSBmLnkpOwoKCS8vbWFrZSBzdXJlIGFsbCB0YXBzIGFkZGVkIHRvZ2V0aGVyIGlzIGV4YWN0bHkgMS4wLCBvdGhlcndpc2Ugc29tZSAodmVyeSBzbWFsbCkgZGlzdG9ydGlvbiBjYW4gb2NjdXIKCWxpbmV0YXBzIC89IGxpbmV0YXBzLnIgKyBsaW5ldGFwcy5nICsgbGluZXRhcHMuYiArIGxpbmV0YXBzLmE7Cgljb2x1bW50YXBzIC89IGNvbHVtbnRhcHMuciArIGNvbHVtbnRhcHMuZyArIGNvbHVtbnRhcHMuYiArIGNvbHVtbnRhcHMuYTsKCgl2ZWMyIHh5c3RhcnQgPSAoLTEuNSAtIGYpICogc3RlcHh5ICsgcG9zOwoJdmVjNCB4cG9zID0gdmVjNCh4eXN0YXJ0LngsIHh5c3RhcnQueCArIHN0ZXB4eS54LCB4eXN0YXJ0LnggKyBzdGVweHkueCAqIDIuMCwgeHlzdGFydC54ICsgc3RlcHh5LnggKiAzLjApOwoKCi8vIGZpbmFsIHN1bSBhbmQgd2VpZ2h0IG5vcm1hbGl6YXRpb24KICAgdmVjNCBmaW5hbCA9IHZlYzQobGluZV9ydW4oeHlzdGFydC55ICAgICAgICAgICAgICAgICAsIHhwb3MsIGxpbmV0YXBzLCBTb3VyY2UpICogY29sdW1udGFwcy5yICsKICAgICAgICAgICAgICAgICAgICAgIGxpbmVfcnVuKHh5c3RhcnQueSArIHN0ZXB4eS55ICAgICAgLCB4cG9zLCBsaW5ldGFwcywgU291cmNlKSAqIGNvbHVtbnRhcHMuZyArCiAgICAgICAgICAgICAgICAgICAgICBsaW5lX3J1bih4eXN0YXJ0LnkgKyBzdGVweHkueSAqIDIuMCwgeHBvcywgbGluZXRhcHMsIFNvdXJjZSkgKiBjb2x1bW50YXBzLmIgKwogICAgICAgICAgICAgICAgICAgICAgbGluZV9ydW4oeHlzdGFydC55ICsgc3RlcHh5LnkgKiAzLjAsIHhwb3MsIGxpbmV0YXBzLCBTb3VyY2UpICogY29sdW1udGFwcy5hLDEpOwoKICAgRnJhZ0NvbG9yID0gZmluYWw7Cn0gCiNlbmRpZgo=\n",
                    },
                ],
            },
            "mix-frames": {
                shader: { type: "text", value: 'shaders = "1"\n\nshader0 = "mix_frames.glsl"\nfilter_linear0 = "false"\n' },
                resources: [
                    {
                        name: "mix_frames.glsl",
                        type: "base64",
                        value:
                            "LyoKCW1peF9mcmFtZXMgLSBwZXJmb3JtcyA1MDo1MCBibGVuZGluZyBiZXR3ZWVuIHRoZSBjdXJyZW50IGFuZCBwcmV2aW91cwoJZnJhbWVzLgoJCglBdXRob3I6IGpkZ2xlYXZlcgoJCglUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdAoJdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUKCVNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yIChhdCB5b3VyIG9wdGlvbikKCWFueSBsYXRlciB2ZXJzaW9uLgoqLwoKI2lmIGRlZmluZWQoVkVSVEVYKQoKI2lmIF9fVkVSU0lPTl9fID49IDEzMAojZGVmaW5lIENPTVBBVF9WQVJZSU5HIG91dAojZGVmaW5lIENPTVBBVF9BVFRSSUJVVEUgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCiNlbHNlCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgdmFyeWluZyAKI2RlZmluZSBDT01QQVRfQVRUUklCVVRFIGF0dHJpYnV0ZSAKI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlMkQKI2VuZGlmCgojaWZkZWYgR0xfRVMKI2lmZGVmIEdMX0ZSQUdNRU5UX1BSRUNJU0lPTl9ISUdICiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBoaWdocAojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gbWVkaXVtcAojZW5kaWYKI2Vsc2UKI2RlZmluZSBDT01QQVRfUFJFQ0lTSU9OCiNlbmRpZgoKLyogQ09NUEFUSUJJTElUWQogICAtIEdMU0wgY29tcGlsZXJzCiovCgpDT01QQVRfQVRUUklCVVRFIENPTVBBVF9QUkVDSVNJT04gdmVjNCBWZXJ0ZXhDb29yZDsKQ09NUEFUX0FUVFJJQlVURSBDT01QQVRfUFJFQ0lTSU9OIHZlYzQgQ09MT1I7CkNPTVBBVF9BVFRSSUJVVEUgQ09NUEFUX1BSRUNJU0lPTiB2ZWM0IFRleENvb3JkOwpDT01QQVRfVkFSWUlORyBDT01QQVRfUFJFQ0lTSU9OIHZlYzQgQ09MMDsKQ09NUEFUX1ZBUllJTkcgQ09NUEFUX1BSRUNJU0lPTiB2ZWM0IFRFWDA7CgpDT01QQVRfUFJFQ0lTSU9OIHZlYzQgX29Qb3NpdGlvbjE7IAp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gbWF0NCBNVlBNYXRyaXg7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVEaXJlY3Rpb247CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiBpbnQgRnJhbWVDb3VudDsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgT3V0cHV0U2l6ZTsKdW5pZm9ybSBDT01QQVRfUFJFQ0lTSU9OIHZlYzIgVGV4dHVyZVNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIElucHV0U2l6ZTsKCnZvaWQgbWFpbigpCnsKCVRFWDAgPSBUZXhDb29yZCAqIDEuMDAwMTsKCWdsX1Bvc2l0aW9uID0gTVZQTWF0cml4ICogVmVydGV4Q29vcmQ7Cn0KCiNlbGlmIGRlZmluZWQoRlJBR01FTlQpCgojaWYgX19WRVJTSU9OX18gPj0gMTMwCiNkZWZpbmUgQ09NUEFUX1ZBUllJTkcgaW4KI2RlZmluZSBDT01QQVRfVEVYVFVSRSB0ZXh0dXJlCm91dCB2ZWM0IEZyYWdDb2xvcjsKI2Vsc2UKI2RlZmluZSBDT01QQVRfVkFSWUlORyB2YXJ5aW5nCiNkZWZpbmUgRnJhZ0NvbG9yIGdsX0ZyYWdDb2xvcgojZGVmaW5lIENPTVBBVF9URVhUVVJFIHRleHR1cmUyRAojZW5kaWYKCiNpZmRlZiBHTF9FUwojaWZkZWYgR0xfRlJBR01FTlRfUFJFQ0lTSU9OX0hJR0gKcHJlY2lzaW9uIGhpZ2hwIGZsb2F0OwojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04gaGlnaHAKI2Vsc2UKcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CiNkZWZpbmUgQ09NUEFUX1BSRUNJU0lPTiBtZWRpdW1wCiNlbmRpZgojZWxzZQojZGVmaW5lIENPTVBBVF9QUkVDSVNJT04KI2VuZGlmCgp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lRGlyZWN0aW9uOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gaW50IEZyYW1lQ291bnQ7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIE91dHB1dFNpemU7CnVuaWZvcm0gQ09NUEFUX1BSRUNJU0lPTiB2ZWMyIFRleHR1cmVTaXplOwp1bmlmb3JtIENPTVBBVF9QUkVDSVNJT04gdmVjMiBJbnB1dFNpemU7CnVuaWZvcm0gc2FtcGxlcjJEIFRleHR1cmU7CnVuaWZvcm0gc2FtcGxlcjJEIFByZXZUZXh0dXJlOwpDT01QQVRfVkFSWUlORyBDT01QQVRfUFJFQ0lTSU9OIHZlYzQgVEVYMDsKCnZvaWQgbWFpbigpCnsKCS8vIEdldCBjb2xvdXIgb2YgY3VycmVudCBwaXhlbAoJQ09NUEFUX1BSRUNJU0lPTiB2ZWMzIGNvbG91ciA9IENPTVBBVF9URVhUVVJFKFRleHR1cmUsIFRFWDAueHkpLnJnYjsKCQoJLy8gR2V0IGNvbG91ciBvZiBwcmV2aW91cyBwaXhlbAoJQ09NUEFUX1BSRUNJU0lPTiB2ZWMzIGNvbG91clByZXYgPSBDT01QQVRfVEVYVFVSRShQcmV2VGV4dHVyZSwgVEVYMC54eSkucmdiOwoJCgkvLyBNaXggY29sb3VycwoJY29sb3VyLnJnYiA9IG1peChjb2xvdXIucmdiLCBjb2xvdXJQcmV2LnJnYiwgMC41KTsKCQoJZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvdXIucmdiLCAxLjApOwp9CiNlbmRpZgo=",
                    },
                ],
            },
        });
    (window.EJS_STORAGE = class {
        constructor(e, t) {
            (this.dbName = e), (this.storeName = t);
        }
        addFileToDB(i, n) {
            (async () => {
                if ("?EJS_KEYS!" !== i) {
                    let e = await this.get("?EJS_KEYS!");
                    var t;
                    (e = e || []), n ? e.includes(i) || e.push(i) : -1 !== (t = e.indexOf(i)) && e.splice(t, 1), this.put("?EJS_KEYS!", e);
                }
            })();
        }
        get(s) {
            return new Promise((i, e) => {
                if (!window.indexedDB) return i();
                let n = indexedDB.open(this.dbName, 1);
                (n.onerror = () => i()),
                    (n.onsuccess = () => {
                        let t = n.result.transaction([this.storeName], "readwrite").objectStore(this.storeName).get(s);
                        (t.onsuccess = (e) => {
                            i(t.result);
                        }),
                            (t.onerror = () => i());
                    }),
                    (n.onupgradeneeded = () => {
                        var e = n.result;
                        e.objectStoreNames.contains(this.storeName) || e.createObjectStore(this.storeName);
                    });
            });
        }
        put(n, s) {
            return new Promise((t, e) => {
                if (!window.indexedDB) return t();
                let i = indexedDB.open(this.dbName, 1);
                (i.onerror = () => {}),
                    (i.onsuccess = () => {
                        var e = i.result.transaction([this.storeName], "readwrite").objectStore(this.storeName).put(s, n);
                        (e.onerror = () => t()),
                            (e.onsuccess = () => {
                                this.addFileToDB(n, !0), t();
                            });
                    }),
                    (i.onupgradeneeded = () => {
                        var e = i.result;
                        e.objectStoreNames.contains(this.storeName) || e.createObjectStore(this.storeName);
                    });
            });
        }
        remove(n) {
            return new Promise((t, e) => {
                if (!window.indexedDB) return t();
                let i = indexedDB.open(this.dbName, 1);
                (i.onerror = () => {}),
                    (i.onsuccess = () => {
                        var e = i.result.transaction([this.storeName], "readwrite").objectStore(this.storeName).delete(n);
                        this.addFileToDB(n, !1), (e.onsuccess = () => t()), (e.onerror = () => {});
                    }),
                    (i.onupgradeneeded = () => {
                        var e = i.result;
                        e.objectStoreNames.contains(this.storeName) || e.createObjectStore(this.storeName);
                    });
            });
        }
        getSizes() {
            return new Promise(async (e, t) => {
                window.indexedDB || e({});
                var i = await this.get("?EJS_KEYS!");
                if (!i) return e({});
                var n = {};
                for (let e = 0; e < i.length; e++) {
                    var s = await this.get(i[e]);
                    s && s.data && "number" == typeof s.data.byteLength && (n[i[e]] = s.data.byteLength);
                }
                e(n);
            });
        }
    }),
        (window.EJS_DUMMYSTORAGE = class {
            constructor() {}
            addFileToDB() {
                return new Promise((e) => e());
            }
            get() {
                return new Promise((e) => e());
            }
            put() {
                return new Promise((e) => e());
            }
            remove() {
                return new Promise((e) => e());
            }
            getSizes() {
                return new Promise((e) => e({}));
            }
        });
    class s {
        constructor() {
            (this.buttonLabels = {
                0: "BUTTON_1",
                1: "BUTTON_2",
                2: "BUTTON_3",
                3: "BUTTON_4",
                4: "LEFT_TOP_SHOULDER",
                5: "RIGHT_TOP_SHOULDER",
                6: "LEFT_BOTTOM_SHOULDER",
                7: "RIGHT_BOTTOM_SHOULDER",
                8: "SELECT",
                9: "START",
                10: "LEFT_STICK",
                11: "RIGHT_STICK",
                12: "DPAD_UP",
                13: "DPAD_DOWN",
                14: "DPAD_LEFT",
                15: "DPAD_RIGHT",
            }),
                (this.gamepads = []),
                (this.listeners = {}),
                (this.timeout = null),
                this.loop();
        }
        terminate() {
            window.clearTimeout(this.timeout);
        }
        getGamepads() {
            return navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [];
        }
        loop() {
            this.updateGamepadState(), (this.timeout = setTimeout(this.loop.bind(this), 10));
        }
        updateGamepadState() {
            let n = Array.from(this.getGamepads());
            n.forEach((l, e) => {
                if (l) {
                    let t = !1;
                    this.gamepads.forEach((o, e) => {
                        if (o.index === l.index) {
                            let s = { axes: [], buttons: {}, index: o.index, id: o.id };
                            (t = !0),
                                o.axes.forEach((e, t) => {
                                    var i = l.axes[t] < 0.01 && -0.01 < l.axes[t] ? 0 : l.axes[t];
                                    if (i !== (e < 0.01 && -0.01 < e ? 0 : e)) {
                                        let e = ["LEFT_STICK_X", "LEFT_STICK_Y", "RIGHT_STICK_X", "RIGHT_STICK_Y"][t];
                                        if (!e) return;
                                        this.dispatchEvent("axischanged", { axis: e, value: i, index: l.index, label: this.getAxisLabel(e, i), gamepadIndex: l.index });
                                    }
                                    s.axes[t] = i;
                                }),
                                l.buttons.forEach((e, t) => {
                                    let i = 1 === o.buttons[t],
                                        n = ("object" == typeof o.buttons[t] && (i = o.buttons[t].pressed), 1 === e);
                                    "object" == typeof e && (n = e.pressed),
                                        (s.buttons[t] = { pressed: n }),
                                        i !== n &&
                                            (n
                                                ? this.dispatchEvent("buttondown", { index: t, label: this.getButtonLabel(t), gamepadIndex: l.index })
                                                : this.dispatchEvent("buttonup", { index: t, label: this.getButtonLabel(t), gamepadIndex: l.index }));
                                }),
                                (this.gamepads[e] = s);
                        }
                    }),
                        t || (this.gamepads.push(n[e]), this.dispatchEvent("connected", { gamepadIndex: l.index }));
                }
            });
            for (let i = 0; i < this.gamepads.length; i++)
                if (this.gamepads[i]) {
                    let t = !1;
                    for (let e = 0; e < n.length; e++)
                        if (n[e] && this.gamepads[i].index === n[e].index) {
                            t = !0;
                            break;
                        }
                    t || (this.dispatchEvent("disconnected", { gamepadIndex: this.gamepads[i].index }), this.gamepads.splice(i, 1), i--);
                }
        }
        dispatchEvent(e, t) {
            "function" == typeof this.listeners[e] && (((t = t || {}).type = e), this.listeners[e](t));
        }
        on(e, t) {
            this.listeners[e.toLowerCase()] = t;
        }
        getButtonLabel(e) {
            return null == e ? null : void 0 === this.buttonLabels[e] ? "GAMEPAD_" + e : this.buttonLabels[e];
        }
        getAxisLabel(e, t) {
            let i = 0.5 < t || t < -0.5 ? (0 < t ? "+1" : "-1") : null;
            return e && i ? e + ":" + i : null;
        }
    }
    window.GamepadHandler = s;
    (window.EJS_GameManager = class {
        constructor(e, t) {
            (this.EJS = t),
                (this.Module = e),
                (this.FS = this.Module.FS),
                (this.functions = {
                    restart: this.Module.cwrap("system_restart", "", []),
                    saveStateInfo: this.Module.cwrap("save_state_info", "string", []),
                    loadState: this.Module.cwrap("load_state", "number", ["string", "number"]),
                    screenshot: this.Module.cwrap("cmd_take_screenshot", "", []),
                    simulateInput: this.Module.cwrap("simulate_input", "null", ["number", "number", "number"]),
                    toggleMainLoop: this.Module.cwrap("toggleMainLoop", "null", ["number"]),
                    getCoreOptions: this.Module.cwrap("get_core_options", "string", []),
                    setVariable: this.Module.cwrap("ejs_set_variable", "null", ["string", "string"]),
                    setCheat: this.Module.cwrap("set_cheat", "null", ["number", "number", "string"]),
                    resetCheat: this.Module.cwrap("reset_cheat", "null", []),
                    toggleShader: this.Module.cwrap("shader_enable", "null", ["number"]),
                    getDiskCount: this.Module.cwrap("get_disk_count", "number", []),
                    getCurrentDisk: this.Module.cwrap("get_current_disk", "number", []),
                    setCurrentDisk: this.Module.cwrap("set_current_disk", "null", ["number"]),
                    getSaveFilePath: this.Module.cwrap("save_file_path", "string", []),
                    saveSaveFiles: this.Module.cwrap("cmd_savefiles", "", []),
                    supportsStates: this.Module.cwrap("supports_states", "number", []),
                    loadSaveFiles: this.Module.cwrap("refresh_save_files", "null", []),
                    toggleFastForward: this.Module.cwrap("toggle_fastforward", "null", ["number"]),
                    setFastForwardRatio: this.Module.cwrap("set_ff_ratio", "null", ["number"]),
                    toggleRewind: this.Module.cwrap("toggle_rewind", "null", ["number"]),
                    setRewindGranularity: this.Module.cwrap("set_rewind_granularity", "null", ["number"]),
                    toggleSlowMotion: this.Module.cwrap("toggle_slow_motion", "null", ["number"]),
                    setSlowMotionRatio: this.Module.cwrap("set_sm_ratio", "null", ["number"]),
                    getFrameNum: this.Module.cwrap("get_current_frame_count", "number", [""]),
                    setVSync: this.Module.cwrap("set_vsync", "null", ["number"]),
                    setVideoRoation: this.Module.cwrap("set_video_rotation", "null", ["number"]),
                }),
                this.writeFile("/home/web_user/retroarch/userdata/retroarch.cfg", this.getRetroArchCfg()),
                this.writeConfigFile(),
                this.initShaders(),
                this.EJS.on("exit", () => {
                    this.EJS.failedToStart || (this.functions.saveSaveFiles(), this.functions.restart(), this.functions.saveSaveFiles()),
                        this.toggleMainLoop(0),
                        this.FS.unmount("/data/saves"),
                        setTimeout(() => {
                            try {
                                this.Module.abort();
                            } catch (e) {
                                console.warn(e);
                            }
                        }, 1e3);
                });
        }
        mountFileSystems() {
            return new Promise(async (e) => {
                this.mkdir("/data"), this.mkdir("/data/saves"), this.FS.mount(this.FS.filesystems.IDBFS, { autoPersist: !0 }, "/data/saves"), this.FS.syncfs(!0, e);
            });
        }
        writeConfigFile() {
            if (this.EJS.defaultCoreOpts.file && this.EJS.defaultCoreOpts.settings) {
                let e = "";
                for (var t in this.EJS.defaultCoreOpts.settings) e += t + ' = "' + this.EJS.defaultCoreOpts.settings[t] + '"\n';
                this.writeFile("/home/web_user/retroarch/userdata/config/" + this.EJS.defaultCoreOpts.file, e);
            }
        }
        loadExternalFiles() {
            return new Promise(async (e, t) => {
                if (this.EJS.config.externalFiles && "Object" === this.EJS.config.externalFiles.constructor.name)
                    for (let l in this.EJS.config.externalFiles)
                        await new Promise((o) => {
                            this.EJS.downloadFile(this.EJS.config.externalFiles[l], null, !0, { responseType: "arraybuffer", method: "GET" }).then(async (e) => {
                                if (-1 === e) return this.EJS.debug && console.warn("Failed to fetch file from '" + this.EJS.config.externalFiles[l] + "'. Make sure the file exists."), o();
                                let t = l;
                                if (l.trim().endsWith("/")) {
                                    var i = /[#<$+%>!`&*'|{}/\\?"=@:^\r\n]/gi,
                                        i = this.EJS.config.externalFiles[l].split("/").pop().split("#")[0].split("?")[0].replace(i, "").trim();
                                    if (!i) return o();
                                    var n = await this.EJS.checkCompression(new Uint8Array(e.data), this.EJS.localization("Decompress Game Assets"));
                                    if (!n["!!notCompressedData"]) {
                                        for (var s in n) this.writeFile(t + s, n[s]);
                                        return o();
                                    }
                                    t += i;
                                }
                                try {
                                    this.writeFile(t, e.data);
                                } catch (e) {
                                    this.EJS.debug && console.warn("Failed to write file to '" + t + "'. Make sure there are no conflicting files.");
                                }
                                o();
                            });
                        });
                e();
            });
        }
        writeFile(e, t) {
            var i = e.split("/");
            let n = "/";
            for (let e = 0; e < i.length - 1; e++) i[e].trim() && ((n += i[e] + "/"), this.mkdir(n));
            this.FS.writeFile(e, t);
        }
        mkdir(e) {
            try {
                this.FS.mkdir(e);
            } catch (e) {}
        }
        getRetroArchCfg() {
            let n =
                'autosave_interval = 60\nscreenshot_directory = "/"\nblock_sram_overwrite = false\nvideo_gpu_screenshot = false\naudio_latency = 64\nvideo_top_portrait_viewport = true\nvideo_vsync = true\nvideo_smooth = false\nfastforward_ratio = 3.0\nslowmotion_ratio = 3.0\n' +
                (this.EJS.rewindEnabled ? "rewind_enable = true\n" : "") +
                (this.EJS.rewindEnabled ? "rewind_granularity = 6\n" : "") +
                'savefile_directory = "/data/saves"\n';
            return (
                this.EJS.retroarchOpts &&
                    Array.isArray(this.EJS.retroarchOpts) &&
                    this.EJS.retroarchOpts.forEach((e) => {
                        let t = this.EJS.preGetSetting(e.name);
                        console.log(t), (t = t || e.default);
                        var i = !1 === e.isString ? t : '"' + t + '"';
                        n += e.name + " = " + i + "\n";
                    }),
                n
            );
        }
        initShaders() {
            if (this.EJS.config.shaders)
                for (var e in (this.mkdir("/shader"), this.EJS.config.shaders)) {
                    var t = this.EJS.config.shaders[e];
                    "string" == typeof t && this.FS.writeFile("/shader/" + e, t);
                }
        }
        clearEJSResetTimer() {
            this.EJS.resetTimeout && (clearTimeout(this.EJS.resetTimeout), delete this.EJS.resetTimeout);
        }
        restart() {
            this.clearEJSResetTimer(), this.functions.restart();
        }
        getState() {
            var e,
                t = this.functions.saveStateInfo().split("|");
            return "1" !== t[2] ? (console.error(t[0]), t[0]) : ((e = parseInt(t[0])), (t = parseInt(t[1])), (t = this.Module.HEAPU8.subarray(t, t + e)), new Uint8Array(t));
        }
        loadState(e) {
            try {
                this.FS.unlink("game.state");
            } catch (e) {}
            this.FS.writeFile("/game.state", e),
                this.clearEJSResetTimer(),
                this.functions.loadState("game.state", 0),
                setTimeout(() => {
                    try {
                        this.FS.unlink("game.state");
                    } catch (e) {}
                }, 5e3);
        }
        screenshot() {
            return (
                this.functions.screenshot(),
                new Promise(async (e) => {
                    for (;;) {
                        try {
                            return this.FS.stat("/screenshot.png"), e(this.FS.readFile("/screenshot.png"));
                        } catch (e) {}
                        await new Promise((e) => setTimeout(e, 50));
                    }
                })
            );
        }
        quickSave(i) {
            (i = i || 1),
                (async () => {
                    var e = i + "-quick.state";
                    try {
                        this.FS.unlink(e);
                    } catch (e) {}
                    var t = await this.getState();
                    this.FS.writeFile("/" + e, t);
                })();
        }
        quickLoad(t) {
            (t = t || 1),
                (async () => {
                    var e = t + "-quick.state";
                    this.clearEJSResetTimer(), this.functions.loadState(e, 0);
                })();
        }
        simulateInput(e, t, i) {
            if (this.EJS.isNetplay) this.EJS.netplay.simulateInput(e, t, i);
            else if ([24, 25, 26, 27, 28, 29].includes(t)) {
                var n;
                if (
                    (24 === t && 1 === i && ((n = this.EJS.settings["save-state-slot"] || "1"), this.quickSave(n), this.EJS.displayMessage(this.EJS.localization("SAVED STATE TO SLOT") + " " + n)),
                    25 === t && 1 === i && ((n = this.EJS.settings["save-state-slot"] || "1"), this.quickLoad(n), this.EJS.displayMessage(this.EJS.localization("LOADED STATE FROM SLOT") + " " + n)),
                    26 === t && 1 === i)
                ) {
                    let t;
                    try {
                        t = parseFloat(this.EJS.settings["save-state-slot"] || "1") + 1;
                    } catch (e) {
                        t = 1;
                    }
                    9 < t && (t = 1), this.EJS.displayMessage(this.EJS.localization("SET SAVE STATE SLOT TO") + " " + t), this.EJS.changeSettingOption("save-state-slot", t.toString());
                }
                27 === t && this.functions.toggleFastForward(this.EJS.isFastForward ? !i : i),
                    29 === t && this.functions.toggleSlowMotion(this.EJS.isSlowMotion ? !i : i),
                    28 === t && this.EJS.rewindEnabled && this.functions.toggleRewind(i);
            } else this.functions.simulateInput(e, t, i);
        }
        getFileNames() {
            return "picodrive" === this.EJS.getCore() ? ["bin", "gen", "smd", "md", "32x", "cue", "iso", "sms", "68k", "chd"] : ["toc", "ccd", "exe", "pbp", "chd", "img", "bin", "iso"];
        }
        createCueFile(i) {
            try {
                1 < i.length &&
                    (i = (i = i.filter((e) => this.getFileNames().includes(e.split(".").pop().toLowerCase()))).sort((e, t) => {
                        if (isNaN(e.charAt()) || isNaN(t.charAt())) throw new Error("Incorrect file name format");
                        return parseInt(e.charAt()) > parseInt(t.charAt()) ? 1 : -1;
                    }));
            } catch (e) {
                if (1 < i.length) return console.warn("Could not auto-create cue file(s)."), null;
            }
            for (let e = 0; e < i.length; e++) if ("ccd" === i[e].split(".").pop().toLowerCase()) return console.warn("Did not auto-create cue file(s). Found a ccd."), null;
            if (0 === i.length) return console.warn("Could not auto-create cue file(s)."), null;
            let n = i[0].split("/").pop();
            n.includes(".") && (n = n.substring(0, n.length - n.split(".").pop().length - 1));
            for (let e = 0; e < i.length; e++) {
                var t = ' FILE "' + i[e] + '" BINARY\n  TRACK 01 MODE1/2352\n   INDEX 01 00:00:00';
                this.FS.writeFile("/" + n + "-" + e + ".cue", t);
            }
            if (1 < i.length) {
                let t = "";
                for (let e = 0; e < i.length; e++) t += "/" + n + "-" + e + ".cue\n";
                this.FS.writeFile("/" + n + ".m3u", t);
            }
            return 1 === i.length ? n + "-0.cue" : n + ".m3u";
        }
        loadPpssppAssets() {
            return new Promise((t) => {
                this.EJS.downloadFile("cores/ppsspp-assets.zip", null, !1, { responseType: "arraybuffer", method: "GET" }).then((e) => {
                    this.EJS.checkCompression(new Uint8Array(e.data), this.EJS.localization("Decompress Game Data")).then((e) => {
                        if (-1 === e) (this.EJS.textElem.innerText = this.localization("Network Error")), (this.EJS.textElem.style.color = "red");
                        else {
                            for (var i in (this.mkdir("/PPSSPP"), e)) {
                                var n = e[i],
                                    i = "/PPSSPP/" + i,
                                    s = i.split("/");
                                let t = "";
                                for (let e = 0; e < s.length - 1; e++) "" === s[e] || ((t += "/" + s[e]), this.FS.analyzePath(t).exists) || this.FS.mkdir(t);
                                i.endsWith("/") || this.FS.writeFile(i, n);
                            }
                            t();
                        }
                    });
                });
            });
        }
        setVSync(e) {
            this.functions.setVSync(e);
        }
        toggleMainLoop(e) {
            this.functions.toggleMainLoop(e);
        }
        getCoreOptions() {
            return this.functions.getCoreOptions();
        }
        setVariable(e, t) {
            this.functions.setVariable(e, t);
        }
        setCheat(e, t, i) {
            this.functions.setCheat(e, t, i);
        }
        resetCheat() {
            this.functions.resetCheat();
        }
        toggleShader(e) {
            this.functions.toggleShader(e);
        }
        getDiskCount() {
            return this.functions.getDiskCount();
        }
        getCurrentDisk() {
            return this.functions.getCurrentDisk();
        }
        setCurrentDisk(e) {
            this.functions.setCurrentDisk(e);
        }
        getSaveFilePath() {
            return this.functions.getSaveFilePath();
        }
        saveSaveFiles() {
            this.functions.saveSaveFiles();
        }
        supportsStates() {
            return !!this.functions.supportsStates();
        }
        getSaveFile() {
            return this.saveSaveFiles(), this.FS.analyzePath(this.getSaveFilePath()).exists ? this.FS.readFile(this.getSaveFilePath()) : null;
        }
        loadSaveFiles() {
            this.clearEJSResetTimer(), this.functions.loadSaveFiles();
        }
        setFastForwardRatio(e) {
            this.functions.setFastForwardRatio(e);
        }
        toggleFastForward(e) {
            this.functions.toggleFastForward(e);
        }
        setSlowMotionRatio(e) {
            this.functions.setSlowMotionRatio(e);
        }
        toggleSlowMotion(e) {
            this.functions.toggleSlowMotion(e);
        }
        setRewindGranularity(e) {
            this.functions.setRewindGranularity(e);
        }
        getFrameNum() {
            return this.functions.getFrameNum();
        }
        setVideoRotation(e) {
            try {
                this.functions.setVideoRoation(e);
            } catch (e) {
                console.warn(e);
            }
        }
    }),
        (t = this),
        (i = function () {
            function r(e) {
                return (r =
                    "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
                          })(e);
            }
            function s(e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
            }
            function k(e, t) {
                for (var i = 0; i < t.length; i++) {
                    var n = t[i];
                    (n.enumerable = n.enumerable || !1), (n.configurable = !0), "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
                }
            }
            function e(e, t, i) {
                return t && k(e.prototype, t), i && k(e, i), Object.defineProperty(e, "prototype", { writable: !1 }), e;
            }
            function a() {
                return (a = Object.assign
                    ? Object.assign.bind()
                    : function (e) {
                          for (var t = 1; t < arguments.length; t++) {
                              var i,
                                  n = arguments[t];
                              for (i in n) Object.prototype.hasOwnProperty.call(n, i) && (e[i] = n[i]);
                          }
                          return e;
                      }).apply(this, arguments);
            }
            function t(e, t) {
                if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
                (e.prototype = Object.create(t && t.prototype, { constructor: { value: e, writable: !0, configurable: !0 } })), Object.defineProperty(e, "prototype", { writable: !1 }), t && l(e, t);
            }
            function o(e) {
                return (o = Object.setPrototypeOf
                    ? Object.getPrototypeOf.bind()
                    : function (e) {
                          return e.__proto__ || Object.getPrototypeOf(e);
                      })(e);
            }
            function l(e, t) {
                return (l = Object.setPrototypeOf
                    ? Object.setPrototypeOf.bind()
                    : function (e, t) {
                          return (e.__proto__ = t), e;
                      })(e, t);
            }
            function E() {
                if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                if (Reflect.construct.sham) return !1;
                if ("function" == typeof Proxy) return !0;
                try {
                    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
                } catch (e) {
                    return !1;
                }
            }
            function Q(e, t, i) {
                return (Q = E()
                    ? Reflect.construct.bind()
                    : function (e, t, i) {
                          var n = [null],
                              t = (n.push.apply(n, t), new (Function.bind.apply(e, n))());
                          return i && l(t, i.prototype), t;
                      }).apply(null, arguments);
            }
            function K(e) {
                var i = "function" == typeof Map ? new Map() : void 0;
                return (function (e) {
                    if (null === e || -1 === Function.toString.call(e).indexOf("[native code]")) return e;
                    if ("function" != typeof e) throw new TypeError("Super expression must either be null or a function");
                    if (void 0 !== i) {
                        if (i.has(e)) return i.get(e);
                        i.set(e, t);
                    }
                    function t() {
                        return Q(e, arguments, o(this).constructor);
                    }
                    return (t.prototype = Object.create(e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } })), l(t, e);
                })(e);
            }
            function c(e) {
                if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return e;
            }
            function i(i) {
                var n = E();
                return function () {
                    var e,
                        t = o(i),
                        t = ((e = n ? ((e = o(this).constructor), Reflect.construct(t, arguments, e)) : t.apply(this, arguments)), this);
                    if (e && ("object" == typeof e || "function" == typeof e)) return e;
                    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
                    return c(t);
                };
            }
            function n() {
                return (n =
                    "undefined" != typeof Reflect && Reflect.get
                        ? Reflect.get.bind()
                        : function (e, t, i) {
                              var n = ((e, t) => {
                                  for (; !Object.prototype.hasOwnProperty.call(e, t) && null !== (e = o(e)); );
                                  return e;
                              })(e, t);
                              if (n) return (n = Object.getOwnPropertyDescriptor(n, t)).get ? n.get.call(arguments.length < 3 ? e : i) : n.value;
                          }).apply(this, arguments);
            }
            function X(e, t) {
                (null == t || t > e.length) && (t = e.length);
                for (var i = 0, n = new Array(t); i < t; i++) n[i] = e[i];
                return n;
            }
            function L(e, t) {
                var i,
                    n,
                    s,
                    o,
                    l = ("undefined" != typeof Symbol && e[Symbol.iterator]) || e["@@iterator"];
                if (l)
                    return (
                        (s = !(n = !0)),
                        {
                            s: function () {
                                l = l.call(e);
                            },
                            n: function () {
                                var e = l.next();
                                return (n = e.done), e;
                            },
                            e: function (e) {
                                (s = !0), (i = e);
                            },
                            f: function () {
                                try {
                                    n || null == l.return || l.return();
                                } finally {
                                    if (s) throw i;
                                }
                            },
                        }
                    );
                if (
                    Array.isArray(e) ||
                    (l = ((e) => {
                        var t;
                        if (e)
                            return "string" == typeof e
                                ? X(e, void 0)
                                : "Map" === (t = "Object" === (t = Object.prototype.toString.call(e).slice(8, -1)) && e.constructor ? e.constructor.name : t) || "Set" === t
                                ? Array.from(e)
                                : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
                                ? X(e, void 0)
                                : void 0;
                    })(e)) ||
                    (t && e && "number" == typeof e.length)
                )
                    return (
                        l && (e = l),
                        (o = 0),
                        {
                            s: (t = function () {}),
                            n: function () {
                                return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
                            },
                            e: function (e) {
                                throw e;
                            },
                            f: t,
                        }
                    );
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var d = Object.create(null),
                g = ((d.open = "0"), (d.close = "1"), (d.ping = "2"), (d.pong = "3"), (d.message = "4"), (d.upgrade = "5"), (d.noop = "6"), Object.create(null));
            Object.keys(d).forEach(function (e) {
                g[d[e]] = e;
            });
            function Y(e) {
                return "function" == typeof ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer instanceof ArrayBuffer;
            }
            function j(e, t, i) {
                var n = e.type,
                    e = e.data;
                D && e instanceof Blob ? (t ? i(e) : J(e, i)) : x && (e instanceof ArrayBuffer || Y(e)) ? (t ? i(e) : J(new Blob([e]), i)) : i(d[n] + (e || ""));
            }
            function J(e, t) {
                var i = new FileReader();
                return (
                    (i.onload = function () {
                        var e = i.result.split(",")[1];
                        t("b" + (e || ""));
                    }),
                    i.readAsDataURL(e)
                );
            }
            var H,
                z = { type: "error", data: "parser error" },
                D = "function" == typeof Blob || ("undefined" != typeof Blob && "[object BlobConstructor]" === Object.prototype.toString.call(Blob)),
                x = "function" == typeof ArrayBuffer;
            function O(e) {
                return e instanceof Uint8Array ? e : e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
            }
            for (var P = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", h = "undefined" == typeof Uint8Array ? [] : new Uint8Array(256), p = 0; p < P.length; p++) h[P.charCodeAt(p)] = p;
            function _(e, t) {
                var i;
                return "string" != typeof e
                    ? { type: "message", data: ee(e, t) }
                    : "b" === (i = e.charAt(0))
                    ? {
                          type: "message",
                          data: ((e, t) => {
                              var i;
                              return $
                                  ? ((i = ((e) => {
                                        for (var t, i, n, s, o = 0.75 * e.length, l = e.length, a = 0, o = ("=" === e[e.length - 1] && (o--, "=" === e[e.length - 2]) && o--, new ArrayBuffer(o)), r = new Uint8Array(o), c = 0; c < l; c += 4)
                                            (t = h[e.charCodeAt(c)]),
                                                (i = h[e.charCodeAt(c + 1)]),
                                                (n = h[e.charCodeAt(c + 2)]),
                                                (s = h[e.charCodeAt(c + 3)]),
                                                (r[a++] = (t << 2) | (i >> 4)),
                                                (r[a++] = ((15 & i) << 4) | (n >> 2)),
                                                (r[a++] = ((3 & n) << 6) | (63 & s));
                                        return o;
                                    })(e)),
                                    ee(i, t))
                                  : { base64: !0, data: e };
                          })(e.substring(1), t),
                      }
                    : g[i]
                    ? 1 < e.length
                        ? { type: g[i], data: e.substring(1) }
                        : { type: g[i] }
                    : z;
            }
            var q,
                $ = "function" == typeof ArrayBuffer,
                ee = function (e, t) {
                    return "blob" === t ? (e instanceof Blob ? e : new Blob([e])) : e instanceof ArrayBuffer ? e : e.buffer;
                },
                te = String.fromCharCode(30);
            function u(e) {
                if (e) {
                    var t,
                        i = e;
                    for (t in u.prototype) i[t] = u.prototype[t];
                    return i;
                }
            }
            (u.prototype.on = u.prototype.addEventListener = function (e, t) {
                return (this._callbacks = this._callbacks || {}), (this._callbacks["$" + e] = this._callbacks["$" + e] || []).push(t), this;
            }),
                (u.prototype.once = function (e, t) {
                    function i() {
                        this.off(e, i), t.apply(this, arguments);
                    }
                    return (i.fn = t), this.on(e, i), this;
                }),
                (u.prototype.off = u.prototype.removeListener = u.prototype.removeAllListeners = u.prototype.removeEventListener = function (e, t) {
                    if (((this._callbacks = this._callbacks || {}), 0 == arguments.length)) this._callbacks = {};
                    else {
                        var i,
                            n = this._callbacks["$" + e];
                        if (n)
                            if (1 == arguments.length) delete this._callbacks["$" + e];
                            else {
                                for (var s = 0; s < n.length; s++)
                                    if ((i = n[s]) === t || i.fn === t) {
                                        n.splice(s, 1);
                                        break;
                                    }
                                0 === n.length && delete this._callbacks["$" + e];
                            }
                    }
                    return this;
                }),
                (u.prototype.emitReserved = u.prototype.emit = function (e) {
                    this._callbacks = this._callbacks || {};
                    for (var t = new Array(arguments.length - 1), i = this._callbacks["$" + e], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
                    if (i) for (var n = 0, s = (i = i.slice(0)).length; n < s; ++n) i[n].apply(this, t);
                    return this;
                }),
                (u.prototype.listeners = function (e) {
                    return (this._callbacks = this._callbacks || {}), this._callbacks["$" + e] || [];
                }),
                (u.prototype.hasListeners = function (e) {
                    return !!this.listeners(e).length;
                });
            var m = "undefined" != typeof self ? self : "undefined" != typeof window ? window : Function("return this")();
            function ie(i) {
                for (var e = arguments.length, t = new Array(1 < e ? e - 1 : 0), n = 1; n < e; n++) t[n - 1] = arguments[n];
                return t.reduce(function (e, t) {
                    return i.hasOwnProperty(t) && (e[t] = i[t]), e;
                }, {});
            }
            var ne = m.setTimeout,
                se = m.clearTimeout;
            function I(e, t) {
                t.useNativeTimers ? ((e.setTimeoutFn = ne.bind(m)), (e.clearTimeoutFn = se.bind(m))) : ((e.setTimeoutFn = m.setTimeout.bind(m)), (e.clearTimeoutFn = m.clearTimeout.bind(m)));
            }
            t(Z, K(Error)), (ae = i(Z));
            var oe,
                le,
                ae,
                re = e(Z),
                C =
                    (t(b, u),
                    (le = i(b)),
                    e(b, [
                        {
                            key: "onError",
                            value: function (e, t, i) {
                                return n(o(b.prototype), "emitReserved", this).call(this, "error", new re(e, t, i)), this;
                            },
                        },
                        {
                            key: "open",
                            value: function () {
                                return (this.readyState = "opening"), this.doOpen(), this;
                            },
                        },
                        {
                            key: "close",
                            value: function () {
                                return ("opening" !== this.readyState && "open" !== this.readyState) || (this.doClose(), this.onClose()), this;
                            },
                        },
                        {
                            key: "send",
                            value: function (e) {
                                "open" === this.readyState && this.write(e);
                            },
                        },
                        {
                            key: "onOpen",
                            value: function () {
                                (this.readyState = "open"), (this.writable = !0), n(o(b.prototype), "emitReserved", this).call(this, "open");
                            },
                        },
                        {
                            key: "onData",
                            value: function (e) {
                                e = _(e, this.socket.binaryType);
                                this.onPacket(e);
                            },
                        },
                        {
                            key: "onPacket",
                            value: function (e) {
                                n(o(b.prototype), "emitReserved", this).call(this, "packet", e);
                            },
                        },
                        {
                            key: "onClose",
                            value: function (e) {
                                (this.readyState = "closed"), n(o(b.prototype), "emitReserved", this).call(this, "close", e);
                            },
                        },
                        { key: "pause", value: function (e) {} },
                        {
                            key: "createUri",
                            value: function (e) {
                                var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
                                return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(t);
                            },
                        },
                        {
                            key: "_hostname",
                            value: function () {
                                var e = this.opts.hostname;
                                return -1 === e.indexOf(":") ? e : "[" + e + "]";
                            },
                        },
                        {
                            key: "_port",
                            value: function () {
                                return this.opts.port && ((this.opts.secure && Number(443 !== this.opts.port)) || (!this.opts.secure && 80 !== Number(this.opts.port))) ? ":" + this.opts.port : "";
                            },
                        },
                        {
                            key: "_query",
                            value: function (e) {
                                e = ((e) => {
                                    var t,
                                        i = "";
                                    for (t in e) e.hasOwnProperty(t) && (i.length && (i += "&"), (i += encodeURIComponent(t) + "=" + encodeURIComponent(e[t])));
                                    return i;
                                })(e);
                                return e.length ? "?" + e : "";
                            },
                        },
                    ]),
                    b),
                ce = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""),
                de = 0,
                y = 0;
            function b(e) {
                var t;
                return s(this, b), ((t = le.call(this)).writable = !1), I(c(t), e), (t.opts = e), (t.query = e.query), (t.socket = e.socket), t;
            }
            function Z(e, t, i) {
                return s(this, Z), ((e = ae.call(this, e)).description = t), (e.context = i), (e.type = "TransportError"), e;
            }
            function ge(e) {
                for (var t = ""; (t = ce[e % 64] + t), 0 < (e = Math.floor(e / 64)); );
                return t;
            }
            function he() {
                var e = ge(+new Date());
                return e !== oe ? ((de = 0), (oe = e)) : e + "." + ge(de++);
            }
            for (; y < 64; y++) ce[y], y;
            var V = !1;
            try {
                V = "undefined" != typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
            } catch (r) {}
            var pe = V;
            function ue(e) {
                var t = e.xdomain;
                try {
                    if ("undefined" != typeof XMLHttpRequest && (!t || pe)) return new XMLHttpRequest();
                } catch (e) {}
                if (!t)
                    try {
                        return new m[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
                    } catch (e) {}
            }
            function me() {}
            var Ie,
                Ce,
                ye = null != new ue({ xdomain: !1 }).responseType,
                V =
                    (t(f, C),
                    (Ce = i(f)),
                    e(f, [
                        {
                            key: "name",
                            get: function () {
                                return "polling";
                            },
                        },
                        {
                            key: "doOpen",
                            value: function () {
                                this.poll();
                            },
                        },
                        {
                            key: "pause",
                            value: function (e) {
                                function t() {
                                    (n.readyState = "paused"), e();
                                }
                                var i,
                                    n = this;
                                this.readyState = "pausing";
                                this.polling || !this.writable
                                    ? ((i = 0),
                                      this.polling &&
                                          (i++,
                                          this.once("pollComplete", function () {
                                              --i || t();
                                          })),
                                      this.writable ||
                                          (i++,
                                          this.once("drain", function () {
                                              --i || t();
                                          })))
                                    : t();
                            },
                        },
                        {
                            key: "poll",
                            value: function () {
                                (this.polling = !0), this.doPoll(), this.emitReserved("poll");
                            },
                        },
                        {
                            key: "onData",
                            value: function (e) {
                                var t = this;
                                ((e, t) => {
                                    for (var i = e.split(te), n = [], s = 0; s < i.length; s++) {
                                        var o = _(i[s], t);
                                        if ((n.push(o), "error" === o.type)) break;
                                    }
                                    return n;
                                })(e, this.socket.binaryType).forEach(function (e) {
                                    if (("opening" === t.readyState && "open" === e.type && t.onOpen(), "close" === e.type)) return t.onClose({ description: "transport closed by the server" }), !1;
                                    t.onPacket(e);
                                }),
                                    "closed" !== this.readyState && ((this.polling = !1), this.emitReserved("pollComplete"), "open" === this.readyState) && this.poll();
                            },
                        },
                        {
                            key: "doClose",
                            value: function () {
                                function e() {
                                    t.write([{ type: "close" }]);
                                }
                                var t = this;
                                "open" === this.readyState ? e() : this.once("open", e);
                            },
                        },
                        {
                            key: "write",
                            value: function (e) {
                                var i,
                                    n,
                                    s,
                                    o = this;
                                (this.writable = !1),
                                    (i = (e = e).length),
                                    (n = new Array(i)),
                                    (s = 0),
                                    e.forEach(function (e, t) {
                                        j(e, !1, function (e) {
                                            (n[t] = e),
                                                ++s === i &&
                                                    ((e = n.join(te)),
                                                    o.doWrite(e, function () {
                                                        (o.writable = !0), o.emitReserved("drain");
                                                    }));
                                        });
                                    });
                            },
                        },
                        {
                            key: "uri",
                            value: function () {
                                var e = this.opts.secure ? "https" : "http",
                                    t = this.query || {};
                                return !1 !== this.opts.timestampRequests && (t[this.opts.timestampParam] = he()), this.supportsBinary || t.sid || (t.b64 = 1), this.createUri(e, t);
                            },
                        },
                        {
                            key: "request",
                            value: function () {
                                var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};
                                return a(e, { xd: this.xd, cookieJar: this.cookieJar }, this.opts), new B(this.uri(), e);
                            },
                        },
                        {
                            key: "doWrite",
                            value: function (e, t) {
                                var i = this,
                                    e = this.request({ method: "POST", data: e });
                                e.on("success", t),
                                    e.on("error", function (e, t) {
                                        i.onError("xhr post error", e, t);
                                    });
                            },
                        },
                        {
                            key: "doPoll",
                            value: function () {
                                var i = this,
                                    e = this.request();
                                e.on("data", this.onData.bind(this)),
                                    e.on("error", function (e, t) {
                                        i.onError("xhr poll error", e, t);
                                    }),
                                    (this.pollXhr = e);
                            },
                        },
                    ]),
                    f),
                B =
                    (t(S, u),
                    (Ie = i(S)),
                    e(S, [
                        {
                            key: "create",
                            value: function () {
                                var e,
                                    t = this,
                                    i = ie(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref"),
                                    n = ((i.xdomain = !!this.opts.xd), (this.xhr = new ue(i)));
                                try {
                                    n.open(this.method, this.uri, !0);
                                    try {
                                        if (this.opts.extraHeaders)
                                            for (var s in (n.setDisableHeaderCheck && n.setDisableHeaderCheck(!0), this.opts.extraHeaders)) this.opts.extraHeaders.hasOwnProperty(s) && n.setRequestHeader(s, this.opts.extraHeaders[s]);
                                    } catch (e) {}
                                    if ("POST" === this.method)
                                        try {
                                            n.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                                        } catch (e) {}
                                    try {
                                        n.setRequestHeader("Accept", "*/*");
                                    } catch (e) {}
                                    null != (e = this.opts.cookieJar) && e.addCookies(n),
                                        "withCredentials" in n && (n.withCredentials = this.opts.withCredentials),
                                        this.opts.requestTimeout && (n.timeout = this.opts.requestTimeout),
                                        (n.onreadystatechange = function () {
                                            var e;
                                            3 === n.readyState && null != (e = t.opts.cookieJar) && e.parseCookies(n),
                                                4 === n.readyState &&
                                                    (200 === n.status || 1223 === n.status
                                                        ? t.onLoad()
                                                        : t.setTimeoutFn(function () {
                                                              t.onError("number" == typeof n.status ? n.status : 0);
                                                          }, 0));
                                        }),
                                        n.send(this.data);
                                } catch (e) {
                                    return void this.setTimeoutFn(function () {
                                        t.onError(e);
                                    }, 0);
                                }
                                "undefined" != typeof document && ((this.index = S.requestsCount++), (S.requests[this.index] = this));
                            },
                        },
                        {
                            key: "onError",
                            value: function (e) {
                                this.emitReserved("error", e, this.xhr), this.cleanup(!0);
                            },
                        },
                        {
                            key: "cleanup",
                            value: function (e) {
                                if (null != this.xhr) {
                                    if (((this.xhr.onreadystatechange = me), e))
                                        try {
                                            this.xhr.abort();
                                        } catch (e) {}
                                    "undefined" != typeof document && delete S.requests[this.index], (this.xhr = null);
                                }
                            },
                        },
                        {
                            key: "onLoad",
                            value: function () {
                                var e = this.xhr.responseText;
                                null !== e && (this.emitReserved("data", e), this.emitReserved("success"), this.cleanup());
                            },
                        },
                        {
                            key: "abort",
                            value: function () {
                                this.cleanup();
                            },
                        },
                    ]),
                    S);
            function S(e, t) {
                var i;
                return s(this, S), I(c((i = Ie.call(this))), t), (i.opts = t), (i.method = t.method || "GET"), (i.uri = e), (i.data = void 0 !== t.data ? t.data : null), i.create(), i;
            }
            function f(e) {
                s(this, f),
                    ((t = Ce.call(this, e)).polling = !1),
                    "undefined" != typeof location && ((i = (i = location.port) || ("https:" === location.protocol ? "443" : "80")), (t.xd = (void 0 !== location && e.hostname !== location.hostname) || i !== e.port));
                var t,
                    i = e && e.forceBase64;
                return (t.supportsBinary = ye && !i), t.opts.withCredentials && (t.cookieJar = void 0), t;
            }
            function be() {
                for (var e in B.requests) B.requests.hasOwnProperty(e) && B.requests[e].abort();
            }
            (B.requestsCount = 0),
                (B.requests = {}),
                "undefined" != typeof document && ("function" == typeof attachEvent ? attachEvent("onunload", be) : "function" == typeof addEventListener && addEventListener("onpagehide" in m ? "pagehide" : "unload", be, !1));
            var Ze,
                Ve =
                    "function" == typeof Promise && "function" == typeof Promise.resolve
                        ? function (e) {
                              return Promise.resolve().then(e);
                          }
                        : function (e, t) {
                              return t(e, 0);
                          },
                Be = m.WebSocket || m.MozWebSocket,
                Se = "undefined" != typeof navigator && "string" == typeof navigator.product && "reactnative" === navigator.product.toLowerCase(),
                A =
                    (t(v, C),
                    (Ze = i(v)),
                    e(v, [
                        {
                            key: "name",
                            get: function () {
                                return "websocket";
                            },
                        },
                        {
                            key: "doOpen",
                            value: function () {
                                if (this.check()) {
                                    var e = this.uri(),
                                        t = this.opts.protocols,
                                        i = Se
                                            ? {}
                                            : ie(
                                                  this.opts,
                                                  "agent",
                                                  "perMessageDeflate",
                                                  "pfx",
                                                  "key",
                                                  "passphrase",
                                                  "cert",
                                                  "ca",
                                                  "ciphers",
                                                  "rejectUnauthorized",
                                                  "localAddress",
                                                  "protocolVersion",
                                                  "origin",
                                                  "maxPayload",
                                                  "family",
                                                  "checkServerIdentity"
                                              );
                                    this.opts.extraHeaders && (i.headers = this.opts.extraHeaders);
                                    try {
                                        this.ws = Se ? new Be(e, t, i) : t ? new Be(e, t) : new Be(e);
                                    } catch (e) {
                                        return this.emitReserved("error", e);
                                    }
                                    (this.ws.binaryType = this.socket.binaryType || "arraybuffer"), this.addEventListeners();
                                }
                            },
                        },
                        {
                            key: "addEventListeners",
                            value: function () {
                                var t = this;
                                (this.ws.onopen = function () {
                                    t.opts.autoUnref && t.ws._socket.unref(), t.onOpen();
                                }),
                                    (this.ws.onclose = function (e) {
                                        return t.onClose({ description: "websocket connection closed", context: e });
                                    }),
                                    (this.ws.onmessage = function (e) {
                                        return t.onData(e.data);
                                    }),
                                    (this.ws.onerror = function (e) {
                                        return t.onError("websocket error", e);
                                    });
                            },
                        },
                        {
                            key: "write",
                            value: function (n) {
                                var s = this;
                                this.writable = !1;
                                for (var e = 0; e < n.length; e++)
                                    ((e) => {
                                        var t = n[e],
                                            i = e === n.length - 1;
                                        j(t, s.supportsBinary, function (e) {
                                            try {
                                                s.ws.send(e);
                                            } catch (e) {}
                                            i &&
                                                Ve(function () {
                                                    (s.writable = !0), s.emitReserved("drain");
                                                }, s.setTimeoutFn);
                                        });
                                    })(e);
                            },
                        },
                        {
                            key: "doClose",
                            value: function () {
                                void 0 !== this.ws && (this.ws.close(), (this.ws = null));
                            },
                        },
                        {
                            key: "uri",
                            value: function () {
                                var e = this.opts.secure ? "wss" : "ws",
                                    t = this.query || {};
                                return this.opts.timestampRequests && (t[this.opts.timestampParam] = he()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t);
                            },
                        },
                        {
                            key: "check",
                            value: function () {
                                return !!Be;
                            },
                        },
                    ]),
                    v);
            function v(e) {
                var t;
                return s(this, v), ((t = Ze.call(this, e)).supportsBinary = !e.forceBase64), t;
            }
            t(w, C),
                (fe = i(w)),
                e(w, [
                    {
                        key: "name",
                        get: function () {
                            return "webtransport";
                        },
                    },
                    {
                        key: "doOpen",
                        value: function () {
                            var s = this;
                            "function" == typeof WebTransport &&
                                ((this.transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name])),
                                this.transport.closed.then(function () {
                                    return s.onClose();
                                }),
                                this.transport.ready.then(function () {
                                    s.transport.createBidirectionalStream().then(function (e) {
                                        var n,
                                            t = e.readable.getReader(),
                                            e =
                                                ((s.writer = e.writable.getWriter()),
                                                !(function i() {
                                                    t.read().then(function (e) {
                                                        var t = e.done,
                                                            e = e.value;
                                                        t ||
                                                            ((n =
                                                                (!n && 1 === e.byteLength && 54 === e[0]) ||
                                                                (s.onPacket(((e, t) => ((q = q || new TextDecoder()), (t = t || e[0] < 48 || 54 < e[0]), _(t ? e : q.decode(e), "arraybuffer")))(e, n)), !1)),
                                                            i());
                                                    });
                                                })(),
                                                s.query.sid ? '0{"sid":"'.concat(s.query.sid, '"}') : "0");
                                        s.writer.write(new TextEncoder().encode(e)).then(function () {
                                            return s.onOpen();
                                        });
                                    });
                                }));
                        },
                    },
                    {
                        key: "write",
                        value: function (s) {
                            var o = this;
                            this.writable = !1;
                            for (var e = 0; e < s.length; e++)
                                ((e) => {
                                    var t,
                                        i = s[e],
                                        n = e === s.length - 1;
                                    (e = i),
                                        (t = function (e) {
                                            "message" === i.type && "string" != typeof i.data && 48 <= e[0] && e[0] <= 54 && o.writer.write(Uint8Array.of(54)),
                                                o.writer.write(e).then(function () {
                                                    n &&
                                                        Ve(function () {
                                                            (o.writable = !0), o.emitReserved("drain");
                                                        }, o.setTimeoutFn);
                                                });
                                        }),
                                        D && e.data instanceof Blob
                                            ? e.data.arrayBuffer().then(O).then(t)
                                            : x && (e.data instanceof ArrayBuffer || Y(e.data))
                                            ? t(O(e.data))
                                            : j(e, !1, function (e) {
                                                  (H = H || new TextEncoder()), t(H.encode(e));
                                              });
                                })(e);
                        },
                    },
                    {
                        key: "doClose",
                        value: function () {
                            var e;
                            null != (e = this.transport) && e.close();
                        },
                    },
                ]);
            var fe,
                Ae = { websocket: A, webtransport: w, polling: V },
                ve = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                we = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
            function w() {
                return s(this, w), fe.apply(this, arguments);
            }
            function Ue(e) {
                var t = e,
                    i = e.indexOf("["),
                    n = e.indexOf("]");
                -1 != i && -1 != n && (e = e.substring(0, i) + e.substring(i, n).replace(/:/g, ";") + e.substring(n, e.length));
                for (var s, o = ve.exec(e || ""), l = {}, a = 14; a--; ) l[we[a]] = o[a] || "";
                return (
                    -1 != i && -1 != n && ((l.source = t), (l.host = l.host.substring(1, l.host.length - 1).replace(/;/g, ":")), (l.authority = l.authority.replace("[", "").replace("]", "").replace(/;/g, ":")), (l.ipv6uri = !0)),
                    (l.pathNames = ((i = (e = l.path).replace(/\/{2,9}/g, "/").split("/")), ("/" != e.slice(0, 1) && 0 !== e.length) || i.splice(0, 1), "/" == e.slice(-1) && i.splice(i.length - 1, 1), i)),
                    (l.queryKey =
                        ((s = {}),
                        l.query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function (e, t, i) {
                            t && (s[t] = i);
                        }),
                        s)),
                    l
                );
            }
            t(U, u),
                (Ne = i(U)),
                e(U, [
                    {
                        key: "createTransport",
                        value: function (e) {
                            var t = a({}, this.opts.query),
                                t = ((t.EIO = 4), (t.transport = e), this.id && (t.sid = this.id), a({}, this.opts.transportOptions[e], this.opts, { query: t, socket: this, hostname: this.hostname, secure: this.secure, port: this.port }));
                            return new Ae[e](t);
                        },
                    },
                    {
                        key: "open",
                        value: function () {
                            var e,
                                t = this;
                            if (this.opts.rememberUpgrade && U.priorWebsocketSuccess && -1 !== this.transports.indexOf("websocket")) e = "websocket";
                            else {
                                if (0 === this.transports.length)
                                    return void this.setTimeoutFn(function () {
                                        t.emitReserved("error", "No transports available");
                                    }, 0);
                                e = this.transports[0];
                            }
                            this.readyState = "opening";
                            try {
                                e = this.createTransport(e);
                            } catch (e) {
                                return this.transports.shift(), void this.open();
                            }
                            e.open(), this.setTransport(e);
                        },
                    },
                    {
                        key: "setTransport",
                        value: function (e) {
                            var t = this;
                            this.transport && this.transport.removeAllListeners(),
                                (this.transport = e)
                                    .on("drain", this.onDrain.bind(this))
                                    .on("packet", this.onPacket.bind(this))
                                    .on("error", this.onError.bind(this))
                                    .on("close", function (e) {
                                        return t.onClose("transport close", e);
                                    });
                        },
                    },
                    {
                        key: "probe",
                        value: function (e) {
                            var t = this,
                                i = this.createTransport(e),
                                n = !1,
                                s =
                                    ((U.priorWebsocketSuccess = !1),
                                    function () {
                                        n ||
                                            (i.send([{ type: "ping", data: "probe" }]),
                                            i.once("packet", function (e) {
                                                n ||
                                                    ("pong" === e.type && "probe" === e.data
                                                        ? ((t.upgrading = !0),
                                                          t.emitReserved("upgrading", i),
                                                          i &&
                                                              ((U.priorWebsocketSuccess = "websocket" === i.name),
                                                              t.transport.pause(function () {
                                                                  n || ("closed" !== t.readyState && (d(), t.setTransport(i), i.send([{ type: "upgrade" }]), t.emitReserved("upgrade", i), (i = null), (t.upgrading = !1), t.flush()));
                                                              })))
                                                        : (((e = new Error("probe error")).transport = i.name), t.emitReserved("upgradeError", e)));
                                            }));
                                    });
                            function o() {
                                n || ((n = !0), d(), i.close(), (i = null));
                            }
                            var l = function (e) {
                                e = new Error("probe error: " + e);
                                (e.transport = i.name), o(), t.emitReserved("upgradeError", e);
                            };
                            function a() {
                                l("transport closed");
                            }
                            function r() {
                                l("socket closed");
                            }
                            function c(e) {
                                i && e.name !== i.name && o();
                            }
                            var d = function () {
                                i.removeListener("open", s), i.removeListener("error", l), i.removeListener("close", a), t.off("close", r), t.off("upgrading", c);
                            };
                            i.once("open", s),
                                i.once("error", l),
                                i.once("close", a),
                                this.once("close", r),
                                this.once("upgrading", c),
                                -1 !== this.upgrades.indexOf("webtransport") && "webtransport" !== e
                                    ? this.setTimeoutFn(function () {
                                          n || i.open();
                                      }, 200)
                                    : i.open();
                        },
                    },
                    {
                        key: "onOpen",
                        value: function () {
                            if (((this.readyState = "open"), (U.priorWebsocketSuccess = "websocket" === this.transport.name), this.emitReserved("open"), this.flush(), "open" === this.readyState && this.opts.upgrade))
                                for (var e = 0, t = this.upgrades.length; e < t; e++) this.probe(this.upgrades[e]);
                        },
                    },
                    {
                        key: "onPacket",
                        value: function (e) {
                            if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState)
                                switch ((this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type)) {
                                    case "open":
                                        this.onHandshake(JSON.parse(e.data));
                                        break;
                                    case "ping":
                                        this.resetPingTimeout(), this.sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong");
                                        break;
                                    case "error":
                                        var t = new Error("server error");
                                        (t.code = e.data), this.onError(t);
                                        break;
                                    case "message":
                                        this.emitReserved("data", e.data), this.emitReserved("message", e.data);
                                }
                        },
                    },
                    {
                        key: "onHandshake",
                        value: function (e) {
                            this.emitReserved("handshake", e),
                                (this.id = e.sid),
                                (this.transport.query.sid = e.sid),
                                (this.upgrades = this.filterUpgrades(e.upgrades)),
                                (this.pingInterval = e.pingInterval),
                                (this.pingTimeout = e.pingTimeout),
                                (this.maxPayload = e.maxPayload),
                                this.onOpen(),
                                "closed" !== this.readyState && this.resetPingTimeout();
                        },
                    },
                    {
                        key: "resetPingTimeout",
                        value: function () {
                            var e = this;
                            this.clearTimeoutFn(this.pingTimeoutTimer),
                                (this.pingTimeoutTimer = this.setTimeoutFn(function () {
                                    e.onClose("ping timeout");
                                }, this.pingInterval + this.pingTimeout)),
                                this.opts.autoUnref && this.pingTimeoutTimer.unref();
                        },
                    },
                    {
                        key: "onDrain",
                        value: function () {
                            this.writeBuffer.splice(0, this.prevBufferLen), (this.prevBufferLen = 0) === this.writeBuffer.length ? this.emitReserved("drain") : this.flush();
                        },
                    },
                    {
                        key: "flush",
                        value: function () {
                            var e;
                            "closed" !== this.readyState &&
                                this.transport.writable &&
                                !this.upgrading &&
                                this.writeBuffer.length &&
                                ((e = this.getWritablePackets()), this.transport.send(e), (this.prevBufferLen = e.length), this.emitReserved("flush"));
                        },
                    },
                    {
                        key: "getWritablePackets",
                        value: function () {
                            if (this.maxPayload && "polling" === this.transport.name && 1 < this.writeBuffer.length)
                                for (var e = 1, t = 0; t < this.writeBuffer.length; t++) {
                                    var i = this.writeBuffer[t].data;
                                    if (
                                        (i &&
                                            (e +=
                                                "string" == typeof (i = i)
                                                    ? ((e) => {
                                                          for (var t, i = 0, n = 0, s = e.length; n < s; n++) (t = e.charCodeAt(n)) < 128 ? (i += 1) : t < 2048 ? (i += 2) : t < 55296 || 57344 <= t ? (i += 3) : (n++, (i += 4));
                                                          return i;
                                                      })(i)
                                                    : Math.ceil(1.33 * (i.byteLength || i.size))),
                                        0 < t && e > this.maxPayload)
                                    )
                                        return this.writeBuffer.slice(0, t);
                                    e += 2;
                                }
                            return this.writeBuffer;
                        },
                    },
                    {
                        key: "write",
                        value: function (e, t, i) {
                            return this.sendPacket("message", e, t, i), this;
                        },
                    },
                    {
                        key: "send",
                        value: function (e, t, i) {
                            return this.sendPacket("message", e, t, i), this;
                        },
                    },
                    {
                        key: "sendPacket",
                        value: function (e, t, i, n) {
                            "function" == typeof t && ((n = t), (t = void 0)),
                                "function" == typeof i && ((n = i), (i = null)),
                                "closing" !== this.readyState &&
                                    "closed" !== this.readyState &&
                                    (((i = i || {}).compress = !1 !== i.compress), this.emitReserved("packetCreate", (e = { type: e, data: t, options: i })), this.writeBuffer.push(e), n && this.once("flush", n), this.flush());
                        },
                    },
                    {
                        key: "close",
                        value: function () {
                            function e() {
                                i.off("upgrade", e), i.off("upgradeError", e), n();
                            }
                            function t() {
                                i.once("upgrade", e), i.once("upgradeError", e);
                            }
                            var i = this,
                                n = function () {
                                    i.onClose("forced close"), i.transport.close();
                                };
                            return (
                                ("opening" !== this.readyState && "open" !== this.readyState) ||
                                    ((this.readyState = "closing"),
                                    this.writeBuffer.length
                                        ? this.once("drain", function () {
                                              (i.upgrading ? t : n)();
                                          })
                                        : (this.upgrading ? t : n)()),
                                this
                            );
                        },
                    },
                    {
                        key: "onError",
                        value: function (e) {
                            (U.priorWebsocketSuccess = !1), this.emitReserved("error", e), this.onClose("transport error", e);
                        },
                    },
                    {
                        key: "onClose",
                        value: function (e, t) {
                            ("opening" !== this.readyState && "open" !== this.readyState && "closing" !== this.readyState) ||
                                (this.clearTimeoutFn(this.pingTimeoutTimer),
                                this.transport.removeAllListeners("close"),
                                this.transport.close(),
                                this.transport.removeAllListeners(),
                                "function" == typeof removeEventListener && (removeEventListener("beforeunload", this.beforeunloadEventListener, !1), removeEventListener("offline", this.offlineEventListener, !1)),
                                (this.readyState = "closed"),
                                (this.id = null),
                                this.emitReserved("close", e, t),
                                (this.writeBuffer = []),
                                (this.prevBufferLen = 0));
                        },
                    },
                    {
                        key: "filterUpgrades",
                        value: function (e) {
                            for (var t = [], i = 0, n = e.length; i < n; i++) ~this.transports.indexOf(e[i]) && t.push(e[i]);
                            return t;
                        },
                    },
                ]);
            var Ne,
                Me = U;
            function U(e) {
                var t,
                    i = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {};
                return (
                    s(this, U),
                    ((t = Ne.call(this)).writeBuffer = []),
                    e && "object" === r(e) && ((i = e), (e = null)),
                    e ? ((e = Ue(e)), (i.hostname = e.host), (i.secure = "https" === e.protocol || "wss" === e.protocol), (i.port = e.port), e.query && (i.query = e.query)) : i.host && (i.hostname = Ue(i.host).host),
                    I(c(t), i),
                    (t.secure = null != i.secure ? i.secure : "undefined" != typeof location && "https:" === location.protocol),
                    i.hostname && !i.port && (i.port = t.secure ? "443" : "80"),
                    (t.hostname = i.hostname || ("undefined" != typeof location ? location.hostname : "localhost")),
                    (t.port = i.port || ("undefined" != typeof location && location.port ? location.port : t.secure ? "443" : "80")),
                    (t.transports = i.transports || ["polling", "websocket", "webtransport"]),
                    (t.writeBuffer = []),
                    (t.prevBufferLen = 0),
                    (t.opts = a(
                        {
                            path: "/engine.io",
                            agent: !1,
                            withCredentials: !1,
                            upgrade: !0,
                            timestampParam: "t",
                            rememberUpgrade: !1,
                            addTrailingSlash: !0,
                            rejectUnauthorized: !0,
                            perMessageDeflate: { threshold: 1024 },
                            transportOptions: {},
                            closeOnBeforeunload: !0,
                        },
                        i
                    )),
                    (t.opts.path = t.opts.path.replace(/\/$/, "") + (t.opts.addTrailingSlash ? "/" : "")),
                    "string" == typeof t.opts.query &&
                        (t.opts.query = ((e) => {
                            for (var t = {}, i = e.split("&"), n = 0, s = i.length; n < s; n++) {
                                var o = i[n].split("=");
                                t[decodeURIComponent(o[0])] = decodeURIComponent(o[1]);
                            }
                            return t;
                        })(t.opts.query)),
                    (t.id = null),
                    (t.upgrades = null),
                    (t.pingInterval = null),
                    (t.pingTimeout = null),
                    (t.pingTimeoutTimer = null),
                    "function" == typeof addEventListener &&
                        (t.opts.closeOnBeforeunload &&
                            ((t.beforeunloadEventListener = function () {
                                t.transport && (t.transport.removeAllListeners(), t.transport.close());
                            }),
                            addEventListener("beforeunload", t.beforeunloadEventListener, !1)),
                        "localhost" !== t.hostname) &&
                        ((t.offlineEventListener = function () {
                            t.onClose("transport close", { description: "network connection lost" });
                        }),
                        addEventListener("offline", t.offlineEventListener, !1)),
                    t.open(),
                    t
                );
            }
            Me.protocol = 4;
            var We = "function" == typeof ArrayBuffer,
                C = Object.prototype.toString,
                Fe = "function" == typeof Blob || ("undefined" != typeof Blob && "[object BlobConstructor]" === C.call(Blob)),
                Ge = "function" == typeof File || ("undefined" != typeof File && "[object FileConstructor]" === C.call(File));
            function Re(e) {
                return (We && (e instanceof ArrayBuffer || ((t = e), "function" == typeof ArrayBuffer.isView ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer))) || (Fe && e instanceof Blob) || (Ge && e instanceof File);
                var t;
            }
            function Te(e) {
                var t = [],
                    i = e.data;
                return (
                    (e.data = (function e(t, i) {
                        if (!t) return t;
                        {
                            var n;
                            if (Re(t)) return (n = { _placeholder: !0, num: i.length }), i.push(t), n;
                        }
                        if (Array.isArray(t)) {
                            for (var s = new Array(t.length), o = 0; o < t.length; o++) s[o] = e(t[o], i);
                            return s;
                        }
                        if ("object" === r(t) && !(t instanceof Date)) {
                            var l,
                                a = {};
                            for (l in t) Object.prototype.hasOwnProperty.call(t, l) && (a[l] = e(t[l], i));
                            return a;
                        }
                        return t;
                    })(i, t)),
                    (e.attachments = t.length),
                    { packet: e, buffers: t }
                );
            }
            function ke(e, t) {
                return (
                    (e.data = (function e(t, i) {
                        if (!t) return t;
                        if (t && !0 === t._placeholder) {
                            if ("number" == typeof t.num && 0 <= t.num && t.num < i.length) return i[t.num];
                            throw new Error("illegal attachments");
                        }
                        if (Array.isArray(t)) for (var n = 0; n < t.length; n++) t[n] = e(t[n], i);
                        else if ("object" === r(t)) for (var s in t) Object.prototype.hasOwnProperty.call(t, s) && (t[s] = e(t[s], i));
                        return t;
                    })(e.data, t)),
                    delete e.attachments,
                    e
                );
            }
            var N,
                Ee = ["connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener"],
                V =
                    (((A = N = N || {})[(A.CONNECT = 0)] = "CONNECT"),
                    (A[(A.DISCONNECT = 1)] = "DISCONNECT"),
                    (A[(A.EVENT = 2)] = "EVENT"),
                    (A[(A.ACK = 3)] = "ACK"),
                    (A[(A.CONNECT_ERROR = 4)] = "CONNECT_ERROR"),
                    (A[(A.BINARY_EVENT = 5)] = "BINARY_EVENT"),
                    (A[(A.BINARY_ACK = 6)] = "BINARY_ACK"),
                    e(Qe, [
                        {
                            key: "encode",
                            value: function (e) {
                                return (e.type !== N.EVENT && e.type !== N.ACK) ||
                                    !(function e(t) {
                                        if (t && "object" === r(t))
                                            if (Array.isArray(t)) {
                                                for (var i = 0, n = t.length; i < n; i++) if (e(t[i])) return !0;
                                            } else {
                                                if (Re(t)) return !0;
                                                if (t.toJSON && "function" == typeof t.toJSON && 1 === arguments.length) return e(t.toJSON(), !0);
                                                for (var s in t) if (Object.prototype.hasOwnProperty.call(t, s) && e(t[s])) return !0;
                                            }
                                        return !1;
                                    })(e)
                                    ? [this.encodeAsString(e)]
                                    : this.encodeAsBinary({ type: e.type === N.EVENT ? N.BINARY_EVENT : N.BINARY_ACK, nsp: e.nsp, data: e.data, id: e.id });
                            },
                        },
                        {
                            key: "encodeAsString",
                            value: function (e) {
                                var t = "" + e.type;
                                return (
                                    (e.type !== N.BINARY_EVENT && e.type !== N.BINARY_ACK) || (t += e.attachments + "-"),
                                    e.nsp && "/" !== e.nsp && (t += e.nsp + ","),
                                    null != e.id && (t += e.id),
                                    null != e.data && (t += JSON.stringify(e.data, this.replacer)),
                                    t
                                );
                            },
                        },
                        {
                            key: "encodeAsBinary",
                            value: function (e) {
                                var e = Te(e),
                                    t = this.encodeAsString(e.packet),
                                    e = e.buffers;
                                return e.unshift(t), e;
                            },
                        },
                    ]),
                    Qe);
            function Qe(e) {
                s(this, Qe), (this.replacer = e);
            }
            function Ke(e) {
                return "[object Object]" === Object.prototype.toString.call(e);
            }
            t(M, u),
                (Xe = i(M)),
                e(
                    M,
                    [
                        {
                            key: "add",
                            value: function (e) {
                                var t;
                                if ("string" == typeof e) {
                                    if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
                                    var i = (t = this.decodeString(e)).type === N.BINARY_EVENT;
                                    ((i || t.type === N.BINARY_ACK) && ((t.type = i ? N.EVENT : N.ACK), (this.reconstructor = new Le(t)), 0 !== t.attachments)) || n(o(M.prototype), "emitReserved", this).call(this, "decoded", t);
                                } else {
                                    if (!Re(e) && !e.base64) throw new Error("Unknown type: " + e);
                                    if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
                                    (t = this.reconstructor.takeBinaryData(e)) && ((this.reconstructor = null), n(o(M.prototype), "emitReserved", this).call(this, "decoded", t));
                                }
                            },
                        },
                        {
                            key: "decodeString",
                            value: function (e) {
                                var t = 0,
                                    i = { type: Number(e.charAt(0)) };
                                if (void 0 === N[i.type]) throw new Error("unknown packet type " + i.type);
                                if (i.type === N.BINARY_EVENT || i.type === N.BINARY_ACK) {
                                    for (var n = t + 1; "-" !== e.charAt(++t) && t != e.length; );
                                    n = e.substring(n, t);
                                    if (n != Number(n) || "-" !== e.charAt(t)) throw new Error("Illegal attachments");
                                    i.attachments = Number(n);
                                }
                                if ("/" === e.charAt(t + 1)) {
                                    for (n = t + 1; ++t && "," !== e.charAt(t) && t !== e.length; );
                                    i.nsp = e.substring(n, t);
                                } else i.nsp = "/";
                                n = e.charAt(t + 1);
                                if ("" !== n && Number(n) == n) {
                                    for (n = t + 1; ++t; ) {
                                        var s = e.charAt(t);
                                        if (null == s || Number(s) != s) {
                                            --t;
                                            break;
                                        }
                                        if (t === e.length) break;
                                    }
                                    i.id = Number(e.substring(n, t + 1));
                                }
                                if (e.charAt(++t)) {
                                    n = this.tryParse(e.substr(t));
                                    if (!M.isPayloadValid(i.type, n)) throw new Error("invalid payload");
                                    i.data = n;
                                }
                                return i;
                            },
                        },
                        {
                            key: "tryParse",
                            value: function (e) {
                                try {
                                    return JSON.parse(e, this.reviver);
                                } catch (e) {
                                    return !1;
                                }
                            },
                        },
                        {
                            key: "destroy",
                            value: function () {
                                this.reconstructor && (this.reconstructor.finishedReconstruction(), (this.reconstructor = null));
                            },
                        },
                    ],
                    [
                        {
                            key: "isPayloadValid",
                            value: function (e, t) {
                                switch (e) {
                                    case N.CONNECT:
                                        return Ke(t);
                                    case N.DISCONNECT:
                                        return void 0 === t;
                                    case N.CONNECT_ERROR:
                                        return "string" == typeof t || Ke(t);
                                    case N.EVENT:
                                    case N.BINARY_EVENT:
                                        return Array.isArray(t) && ("number" == typeof t[0] || ("string" == typeof t[0] && -1 === Ee.indexOf(t[0])));
                                    case N.ACK:
                                    case N.BINARY_ACK:
                                        return Array.isArray(t);
                                }
                            },
                        },
                    ]
                );
            var Xe,
                C = M,
                Le =
                    (e(je, [
                        {
                            key: "takeBinaryData",
                            value: function (e) {
                                return this.buffers.push(e), this.buffers.length === this.reconPack.attachments ? ((e = ke(this.reconPack, this.buffers)), this.finishedReconstruction(), e) : null;
                            },
                        },
                        {
                            key: "finishedReconstruction",
                            value: function () {
                                (this.reconPack = null), (this.buffers = []);
                            },
                        },
                    ]),
                    je),
                Ye = Object.freeze({
                    __proto__: null,
                    protocol: 5,
                    get PacketType() {
                        return N;
                    },
                    Encoder: V,
                    Decoder: C,
                });
            function je(e) {
                s(this, je), (this.packet = e), (this.buffers = []), (this.reconPack = e);
            }
            function M(e) {
                var t;
                return s(this, M), ((t = Xe.call(this)).reviver = e), t;
            }
            function W(e, t, i) {
                return (
                    e.on(t, i),
                    function () {
                        e.off(t, i);
                    }
                );
            }
            var Je,
                He = Object.freeze({ connect: 1, connect_error: 1, disconnect: 1, disconnecting: 1, newListener: 1, removeListener: 1 }),
                ze =
                    (t(F, u),
                    (Je = i(F)),
                    e(F, [
                        {
                            key: "disconnected",
                            get: function () {
                                return !this.connected;
                            },
                        },
                        {
                            key: "subEvents",
                            value: function () {
                                var e;
                                this.subs || ((e = this.io), (this.subs = [W(e, "open", this.onopen.bind(this)), W(e, "packet", this.onpacket.bind(this)), W(e, "error", this.onerror.bind(this)), W(e, "close", this.onclose.bind(this))]));
                            },
                        },
                        {
                            key: "active",
                            get: function () {
                                return !!this.subs;
                            },
                        },
                        {
                            key: "connect",
                            value: function () {
                                return this.connected || (this.subEvents(), this.io._reconnecting || this.io.open(), "open" === this.io._readyState && this.onopen()), this;
                            },
                        },
                        {
                            key: "open",
                            value: function () {
                                return this.connect();
                            },
                        },
                        {
                            key: "send",
                            value: function () {
                                for (var e = arguments.length, t = new Array(e), i = 0; i < e; i++) t[i] = arguments[i];
                                return t.unshift("message"), this.emit.apply(this, t), this;
                            },
                        },
                        {
                            key: "emit",
                            value: function (e) {
                                if (He.hasOwnProperty(e)) throw new Error('"' + e.toString() + '" is a reserved event name');
                                for (var t, i, n = arguments.length, s = new Array(1 < n ? n - 1 : 0), o = 1; o < n; o++) s[o - 1] = arguments[o];
                                return (
                                    (s.unshift(e), !this._opts.retries || this.flags.fromQueue || this.flags.volatile)
                                        ? ((i =
                                              (((e = { type: N.EVENT, data: s, options: {} }).options.compress = !1 !== this.flags.compress),
                                              "function" == typeof s[s.length - 1] && ((t = this.ids++), (i = s.pop()), this._registerAckCallback(t, i), (e.id = t)),
                                              this.io.engine && this.io.engine.transport && this.io.engine.transport.writable)),
                                          (!this.flags.volatile || (i && this.connected)) && (this.connected ? (this.notifyOutgoingListeners(e), this.packet(e)) : this.sendBuffer.push(e)),
                                          (this.flags = {}))
                                        : this._addToQueue(s),
                                    this
                                );
                            },
                        },
                        {
                            key: "_registerAckCallback",
                            value: function (t, n) {
                                var s,
                                    o = this,
                                    e = null != (e = this.flags.timeout) ? e : this._opts.ackTimeout;
                                void 0 !== e
                                    ? ((s = this.io.setTimeoutFn(function () {
                                          delete o.acks[t];
                                          for (var e = 0; e < o.sendBuffer.length; e++) o.sendBuffer[e].id === t && o.sendBuffer.splice(e, 1);
                                          n.call(o, new Error("operation has timed out"));
                                      }, e)),
                                      (this.acks[t] = function () {
                                          o.io.clearTimeoutFn(s);
                                          for (var e = arguments.length, t = new Array(e), i = 0; i < e; i++) t[i] = arguments[i];
                                          n.apply(o, [null].concat(t));
                                      }))
                                    : (this.acks[t] = n);
                            },
                        },
                        {
                            key: "emitWithAck",
                            value: function (e) {
                                for (var t = this, i = arguments.length, s = new Array(1 < i ? i - 1 : 0), n = 1; n < i; n++) s[n - 1] = arguments[n];
                                var o = void 0 !== this.flags.timeout || void 0 !== this._opts.ackTimeout;
                                return new Promise(function (i, n) {
                                    s.push(function (e, t) {
                                        return o ? (e ? n(e) : i(t)) : i(e);
                                    }),
                                        t.emit.apply(t, [e].concat(s));
                                });
                            },
                        },
                        {
                            key: "_addToQueue",
                            value: function (e) {
                                var s,
                                    o = this,
                                    l = ("function" == typeof e[e.length - 1] && (s = e.pop()), { id: this._queueSeq++, tryCount: 0, pending: !1, args: e, flags: a({ fromQueue: !0 }, this.flags) });
                                e.push(function (e) {
                                    if (l === o._queue[0]) {
                                        if (null !== e) l.tryCount > o._opts.retries && (o._queue.shift(), s) && s(e);
                                        else if ((o._queue.shift(), s)) {
                                            for (var t = arguments.length, i = new Array(1 < t ? t - 1 : 0), n = 1; n < t; n++) i[n - 1] = arguments[n];
                                            s.apply(void 0, [null].concat(i));
                                        }
                                        return (l.pending = !1), o._drainQueue();
                                    }
                                }),
                                    this._queue.push(l),
                                    this._drainQueue();
                            },
                        },
                        {
                            key: "_drainQueue",
                            value: function () {
                                var e;
                                this.connected &&
                                    0 !== this._queue.length &&
                                    (!(e = this._queue[0]).pending || (0 < arguments.length && void 0 !== arguments[0] && arguments[0])) &&
                                    ((e.pending = !0), e.tryCount++, (this.flags = e.flags), this.emit.apply(this, e.args));
                            },
                        },
                        {
                            key: "packet",
                            value: function (e) {
                                (e.nsp = this.nsp), this.io._packet(e);
                            },
                        },
                        {
                            key: "onopen",
                            value: function () {
                                var t = this;
                                "function" == typeof this.auth
                                    ? this.auth(function (e) {
                                          t._sendConnectPacket(e);
                                      })
                                    : this._sendConnectPacket(this.auth);
                            },
                        },
                        {
                            key: "_sendConnectPacket",
                            value: function (e) {
                                this.packet({ type: N.CONNECT, data: this._pid ? a({ pid: this._pid, offset: this._lastOffset }, e) : e });
                            },
                        },
                        {
                            key: "onerror",
                            value: function (e) {
                                this.connected || this.emitReserved("connect_error", e);
                            },
                        },
                        {
                            key: "onclose",
                            value: function (e, t) {
                                (this.connected = !1), delete this.id, this.emitReserved("disconnect", e, t);
                            },
                        },
                        {
                            key: "onpacket",
                            value: function (e) {
                                if (e.nsp === this.nsp)
                                    switch (e.type) {
                                        case N.CONNECT:
                                            e.data && e.data.sid
                                                ? this.onconnect(e.data.sid, e.data.pid)
                                                : this.emitReserved(
                                                      "connect_error",
                                                      new Error(
                                                          "It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"
                                                      )
                                                  );
                                            break;
                                        case N.EVENT:
                                        case N.BINARY_EVENT:
                                            this.onevent(e);
                                            break;
                                        case N.ACK:
                                        case N.BINARY_ACK:
                                            this.onack(e);
                                            break;
                                        case N.DISCONNECT:
                                            this.ondisconnect();
                                            break;
                                        case N.CONNECT_ERROR:
                                            this.destroy();
                                            var t = new Error(e.data.message);
                                            (t.data = e.data.data), this.emitReserved("connect_error", t);
                                    }
                            },
                        },
                        {
                            key: "onevent",
                            value: function (e) {
                                var t = e.data || [];
                                null != e.id && t.push(this.ack(e.id)), this.connected ? this.emitEvent(t) : this.receiveBuffer.push(Object.freeze(t));
                            },
                        },
                        {
                            key: "emitEvent",
                            value: function (e) {
                                if (this._anyListeners && this._anyListeners.length) {
                                    var t,
                                        i = L(this._anyListeners.slice());
                                    try {
                                        for (i.s(); !(t = i.n()).done; ) t.value.apply(this, e);
                                    } catch (e) {
                                        i.e(e);
                                    } finally {
                                        i.f();
                                    }
                                }
                                n(o(F.prototype), "emit", this).apply(this, e), this._pid && e.length && "string" == typeof e[e.length - 1] && (this._lastOffset = e[e.length - 1]);
                            },
                        },
                        {
                            key: "ack",
                            value: function (n) {
                                var s = this,
                                    o = !1;
                                return function () {
                                    if (!o) {
                                        o = !0;
                                        for (var e = arguments.length, t = new Array(e), i = 0; i < e; i++) t[i] = arguments[i];
                                        s.packet({ type: N.ACK, id: n, data: t });
                                    }
                                };
                            },
                        },
                        {
                            key: "onack",
                            value: function (e) {
                                var t = this.acks[e.id];
                                "function" == typeof t && (t.apply(this, e.data), delete this.acks[e.id]);
                            },
                        },
                        {
                            key: "onconnect",
                            value: function (e, t) {
                                (this.id = e), (this.recovered = t && this._pid === t), (this._pid = t), (this.connected = !0), this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
                            },
                        },
                        {
                            key: "emitBuffered",
                            value: function () {
                                var t = this;
                                this.receiveBuffer.forEach(function (e) {
                                    return t.emitEvent(e);
                                }),
                                    (this.receiveBuffer = []),
                                    this.sendBuffer.forEach(function (e) {
                                        t.notifyOutgoingListeners(e), t.packet(e);
                                    }),
                                    (this.sendBuffer = []);
                            },
                        },
                        {
                            key: "ondisconnect",
                            value: function () {
                                this.destroy(), this.onclose("io server disconnect");
                            },
                        },
                        {
                            key: "destroy",
                            value: function () {
                                this.subs &&
                                    (this.subs.forEach(function (e) {
                                        return e();
                                    }),
                                    (this.subs = void 0)),
                                    this.io._destroy(this);
                            },
                        },
                        {
                            key: "disconnect",
                            value: function () {
                                return this.connected && this.packet({ type: N.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
                            },
                        },
                        {
                            key: "close",
                            value: function () {
                                return this.disconnect();
                            },
                        },
                        {
                            key: "compress",
                            value: function (e) {
                                return (this.flags.compress = e), this;
                            },
                        },
                        {
                            key: "volatile",
                            get: function () {
                                return (this.flags.volatile = !0), this;
                            },
                        },
                        {
                            key: "timeout",
                            value: function (e) {
                                return (this.flags.timeout = e), this;
                            },
                        },
                        {
                            key: "onAny",
                            value: function (e) {
                                return (this._anyListeners = this._anyListeners || []), this._anyListeners.push(e), this;
                            },
                        },
                        {
                            key: "prependAny",
                            value: function (e) {
                                return (this._anyListeners = this._anyListeners || []), this._anyListeners.unshift(e), this;
                            },
                        },
                        {
                            key: "offAny",
                            value: function (e) {
                                if (this._anyListeners)
                                    if (e) {
                                        for (var t = this._anyListeners, i = 0; i < t.length; i++) if (e === t[i]) return t.splice(i, 1), this;
                                    } else this._anyListeners = [];
                                return this;
                            },
                        },
                        {
                            key: "listenersAny",
                            value: function () {
                                return this._anyListeners || [];
                            },
                        },
                        {
                            key: "onAnyOutgoing",
                            value: function (e) {
                                return (this._anyOutgoingListeners = this._anyOutgoingListeners || []), this._anyOutgoingListeners.push(e), this;
                            },
                        },
                        {
                            key: "prependAnyOutgoing",
                            value: function (e) {
                                return (this._anyOutgoingListeners = this._anyOutgoingListeners || []), this._anyOutgoingListeners.unshift(e), this;
                            },
                        },
                        {
                            key: "offAnyOutgoing",
                            value: function (e) {
                                if (this._anyOutgoingListeners)
                                    if (e) {
                                        for (var t = this._anyOutgoingListeners, i = 0; i < t.length; i++) if (e === t[i]) return t.splice(i, 1), this;
                                    } else this._anyOutgoingListeners = [];
                                return this;
                            },
                        },
                        {
                            key: "listenersAnyOutgoing",
                            value: function () {
                                return this._anyOutgoingListeners || [];
                            },
                        },
                        {
                            key: "notifyOutgoingListeners",
                            value: function (e) {
                                if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
                                    var t,
                                        i = L(this._anyOutgoingListeners.slice());
                                    try {
                                        for (i.s(); !(t = i.n()).done; ) t.value.apply(this, e.data);
                                    } catch (e) {
                                        i.e(e);
                                    } finally {
                                        i.f();
                                    }
                                }
                            },
                        },
                    ]),
                    F);
            function F(e, t, i) {
                var n;
                return (
                    s(this, F),
                    ((n = Je.call(this)).connected = !1),
                    (n.recovered = !1),
                    (n.receiveBuffer = []),
                    (n.sendBuffer = []),
                    (n._queue = []),
                    (n._queueSeq = 0),
                    (n.ids = 0),
                    (n.acks = {}),
                    (n.flags = {}),
                    (n.io = e),
                    (n.nsp = t),
                    i && i.auth && (n.auth = i.auth),
                    (n._opts = a({}, i)),
                    n.io._autoConnect && n.open(),
                    n
                );
            }
            function G(e) {
                (this.ms = (e = e || {}).min || 100), (this.max = e.max || 1e4), (this.factor = e.factor || 2), (this.jitter = 0 < e.jitter && e.jitter <= 1 ? e.jitter : 0), (this.attempts = 0);
            }
            (G.prototype.duration = function () {
                var e,
                    t,
                    i = this.ms * Math.pow(this.factor, this.attempts++);
                return this.jitter && ((e = Math.random()), (t = Math.floor(e * this.jitter * i)), (i = 0 == (1 & Math.floor(10 * e)) ? i - t : i + t)), 0 | Math.min(i, this.max);
            }),
                (G.prototype.reset = function () {
                    this.attempts = 0;
                }),
                (G.prototype.setMin = function (e) {
                    this.ms = e;
                }),
                (G.prototype.setMax = function (e) {
                    this.max = e;
                }),
                (G.prototype.setJitter = function (e) {
                    this.jitter = e;
                });
            t(T, u),
                (De = i(T)),
                e(T, [
                    {
                        key: "reconnection",
                        value: function (e) {
                            return arguments.length ? ((this._reconnection = !!e), this) : this._reconnection;
                        },
                    },
                    {
                        key: "reconnectionAttempts",
                        value: function (e) {
                            return void 0 === e ? this._reconnectionAttempts : ((this._reconnectionAttempts = e), this);
                        },
                    },
                    {
                        key: "reconnectionDelay",
                        value: function (e) {
                            var t;
                            return void 0 === e ? this._reconnectionDelay : ((this._reconnectionDelay = e), null != (t = this.backoff) && t.setMin(e), this);
                        },
                    },
                    {
                        key: "randomizationFactor",
                        value: function (e) {
                            var t;
                            return void 0 === e ? this._randomizationFactor : ((this._randomizationFactor = e), null != (t = this.backoff) && t.setJitter(e), this);
                        },
                    },
                    {
                        key: "reconnectionDelayMax",
                        value: function (e) {
                            var t;
                            return void 0 === e ? this._reconnectionDelayMax : ((this._reconnectionDelayMax = e), null != (t = this.backoff) && t.setMax(e), this);
                        },
                    },
                    {
                        key: "timeout",
                        value: function (e) {
                            return arguments.length ? ((this._timeout = e), this) : this._timeout;
                        },
                    },
                    {
                        key: "maybeReconnectOnOpen",
                        value: function () {
                            !this._reconnecting && this._reconnection && 0 === this.backoff.attempts && this.reconnect();
                        },
                    },
                    {
                        key: "open",
                        value: function (t) {
                            var e,
                                i,
                                n,
                                s,
                                o,
                                l,
                                a,
                                r = this;
                            return (
                                ~this._readyState.indexOf("open") ||
                                    ((this.engine = new Me(this.uri, this.opts)),
                                    (e = this.engine),
                                    ((i = this)._readyState = "opening"),
                                    (this.skipReconnect = !1),
                                    (n = W(e, "open", function () {
                                        i.onopen(), t && t();
                                    })),
                                    (o = W(
                                        e,
                                        "error",
                                        (s = function (e) {
                                            r.cleanup(), (r._readyState = "closed"), r.emitReserved("error", e), t ? t(e) : r.maybeReconnectOnOpen();
                                        })
                                    )),
                                    !1 !== this._timeout &&
                                        ((l = this._timeout),
                                        (a = this.setTimeoutFn(function () {
                                            n(), s(new Error("timeout")), e.close();
                                        }, l)),
                                        this.opts.autoUnref && a.unref(),
                                        this.subs.push(function () {
                                            r.clearTimeoutFn(a);
                                        })),
                                    this.subs.push(n),
                                    this.subs.push(o)),
                                this
                            );
                        },
                    },
                    {
                        key: "connect",
                        value: function (e) {
                            return this.open(e);
                        },
                    },
                    {
                        key: "onopen",
                        value: function () {
                            this.cleanup(), (this._readyState = "open"), this.emitReserved("open");
                            var e = this.engine;
                            this.subs.push(
                                W(e, "ping", this.onping.bind(this)),
                                W(e, "data", this.ondata.bind(this)),
                                W(e, "error", this.onerror.bind(this)),
                                W(e, "close", this.onclose.bind(this)),
                                W(this.decoder, "decoded", this.ondecoded.bind(this))
                            );
                        },
                    },
                    {
                        key: "onping",
                        value: function () {
                            this.emitReserved("ping");
                        },
                    },
                    {
                        key: "ondata",
                        value: function (e) {
                            try {
                                this.decoder.add(e);
                            } catch (e) {
                                this.onclose("parse error", e);
                            }
                        },
                    },
                    {
                        key: "ondecoded",
                        value: function (e) {
                            var t = this;
                            Ve(function () {
                                t.emitReserved("packet", e);
                            }, this.setTimeoutFn);
                        },
                    },
                    {
                        key: "onerror",
                        value: function (e) {
                            this.emitReserved("error", e);
                        },
                    },
                    {
                        key: "socket",
                        value: function (e, t) {
                            var i = this.nsps[e];
                            return i ? this._autoConnect && !i.active && i.connect() : ((i = new ze(this, e, t)), (this.nsps[e] = i)), i;
                        },
                    },
                    {
                        key: "_destroy",
                        value: function (e) {
                            for (var t = 0, i = Object.keys(this.nsps); t < i.length; t++) {
                                var n = i[t];
                                if (this.nsps[n].active) return;
                            }
                            this._close();
                        },
                    },
                    {
                        key: "_packet",
                        value: function (e) {
                            for (var t = this.encoder.encode(e), i = 0; i < t.length; i++) this.engine.write(t[i], e.options);
                        },
                    },
                    {
                        key: "cleanup",
                        value: function () {
                            this.subs.forEach(function (e) {
                                return e();
                            }),
                                (this.subs.length = 0),
                                this.decoder.destroy();
                        },
                    },
                    {
                        key: "_close",
                        value: function () {
                            (this.skipReconnect = !0), (this._reconnecting = !1), this.onclose("forced close"), this.engine && this.engine.close();
                        },
                    },
                    {
                        key: "disconnect",
                        value: function () {
                            return this._close();
                        },
                    },
                    {
                        key: "onclose",
                        value: function (e, t) {
                            this.cleanup(), this.backoff.reset(), (this._readyState = "closed"), this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect();
                        },
                    },
                    {
                        key: "reconnect",
                        value: function () {
                            var t = this;
                            if (this._reconnecting || this.skipReconnect) return this;
                            var e,
                                i,
                                n = this;
                            this.backoff.attempts >= this._reconnectionAttempts
                                ? (this.backoff.reset(), this.emitReserved("reconnect_failed"), (this._reconnecting = !1))
                                : ((e = this.backoff.duration()),
                                  (this._reconnecting = !0),
                                  (i = this.setTimeoutFn(function () {
                                      n.skipReconnect ||
                                          (t.emitReserved("reconnect_attempt", n.backoff.attempts), n.skipReconnect) ||
                                          n.open(function (e) {
                                              e ? ((n._reconnecting = !1), n.reconnect(), t.emitReserved("reconnect_error", e)) : n.onreconnect();
                                          });
                                  }, e)),
                                  this.opts.autoUnref && i.unref(),
                                  this.subs.push(function () {
                                      t.clearTimeoutFn(i);
                                  }));
                        },
                    },
                    {
                        key: "onreconnect",
                        value: function () {
                            var e = this.backoff.attempts;
                            (this._reconnecting = !1), this.backoff.reset(), this.emitReserved("reconnect", e);
                        },
                    },
                ]);
            var De,
                xe = T,
                R = {};
            function T(e, t) {
                s(this, T),
                    ((i = De.call(this)).nsps = {}),
                    (i.subs = []),
                    e && "object" === r(e) && ((t = e), (e = void 0)),
                    ((t = t || {}).path = t.path || "/socket.io"),
                    (i.opts = t),
                    I(c(i), t),
                    i.reconnection(!1 !== t.reconnection),
                    i.reconnectionAttempts(t.reconnectionAttempts || 1 / 0),
                    i.reconnectionDelay(t.reconnectionDelay || 1e3),
                    i.reconnectionDelayMax(t.reconnectionDelayMax || 5e3),
                    i.randomizationFactor(null != (n = t.randomizationFactor) ? n : 0.5),
                    (i.backoff = new G({ min: i.reconnectionDelay(), max: i.reconnectionDelayMax(), jitter: i.randomizationFactor() })),
                    i.timeout(null == t.timeout ? 2e4 : t.timeout),
                    (i._readyState = "closed"),
                    (i.uri = e);
                var i,
                    n = t.parser || Ye;
                return (i.encoder = new n.Encoder()), (i.decoder = new n.Decoder()), (i._autoConnect = !1 !== t.autoConnect), i._autoConnect && i.open(), i;
            }
            function Oe(e, t) {
                "object" === r(e) && ((t = e), (e = void 0));
                var e = (function (e, t, i) {
                        var t = 1 < arguments.length && void 0 !== t ? t : "",
                            n = e,
                            i = (2 < arguments.length ? i : void 0) || ("undefined" != typeof location && location),
                            e =
                                ("string" == typeof (e = null == e ? i.protocol + "//" + i.host : e) &&
                                    ("/" === e.charAt(0) && (e = "/" === e.charAt(1) ? i.protocol + e : i.host + e), (n = Ue((e = /^(https?|wss?):\/\//.test(e) ? e : i.protocol + "//" + e)))),
                                n.port || (/^(http|ws)$/.test(n.protocol) ? (n.port = "80") : /^(http|ws)s$/.test(n.protocol) && (n.port = "443")),
                                (n.path = n.path || "/"),
                                -1 !== n.host.indexOf(":") ? "[" + n.host + "]" : n.host);
                        return (n.id = n.protocol + "://" + e + ":" + n.port + t), (n.href = n.protocol + "://" + e + (i && i.port === n.port ? "" : ":" + n.port)), n;
                    })(e, (t = t || {}).path || "/socket.io"),
                    i = e.source,
                    n = e.id,
                    s = R[n] && e.path in R[n].nsps,
                    s = t.forceNew || t["force new connection"] || !1 === t.multiplex || s ? new xe(i, t) : (R[n] || (R[n] = new xe(i, t)), R[n]);
                return e.query && !t.query && (t.query = e.queryKey), s.socket(e.path, t);
            }
            return a(Oe, { Manager: xe, Socket: ze, io: Oe, connect: Oe }), Oe;
        }),
        "object" == typeof exports && "undefined" != typeof module ? (module.exports = i()) : "function" == typeof define && define.amd ? define(i) : ((t = "undefined" != typeof globalThis ? globalThis : t || self).io = i());
    window.EJS_COMPRESSION = class {
        constructor(e) {
            this.EJS = e;
        }
        isCompressed(e) {
            return 80 === e[0] && 75 === e[1] && ((3 === e[2] && 4 === e[3]) || (5 === e[2] && 6 === e[3]) || (7 === e[2] && 8 === e[3]))
                ? "zip"
                : 55 === e[0] && 122 === e[1] && 188 === e[2] && 175 === e[3] && 39 === e[4] && 28 === e[5]
                ? "7z"
                : 82 === e[0] && 97 === e[1] && 114 === e[2] && 33 === e[3] && 26 === e[4] && 7 === e[5] && (0 === e[6] || (1 === e[6] && 0 == e[7]))
                ? "rar"
                : null;
        }
        decompress(t, e, i) {
            var n = this.isCompressed(t.slice(0, 10));
            return null === n ? ("function" == typeof i && i("!!notCompressedData", t), new Promise((e) => e({ "!!notCompressedData": t }))) : this.decompressFile(n, t, e, i);
        }
        getWorkerFile(l) {
            return new Promise(async (t, e) => {
                let i, n;
                "7z" === l ? ((i = "compression/extract7z.js"), (n = "sevenZip")) : "zip" === l ? ((i = "compression/extractzip.js"), (n = "zip")) : "rar" === l && ((i = "compression/libunrar.js"), (n = "rar"));
                var s = await this.EJS.downloadFile(i, null, !1, { responseType: "text", method: "GET" });
                if (-1 === s) this.EJS.startGameError(this.EJS.localization("Network Error"));
                else if ("rar" === l) {
                    var o = await this.EJS.downloadFile("compression/libunrar.wasm", null, !1, { responseType: "arraybuffer", method: "GET" });
                    if (-1 === o) this.EJS.startGameError(this.EJS.localization("Network Error"));
                    else {
                        let e = URL.createObjectURL(new Blob([o.data], { type: "application/wasm" }));
                        o =
                            "\nlet dataToPass = [];\nModule = {\n    monitorRunDependencies: function(left)  {\n        if (left == 0) {\n            setTimeout(function() {\n                unrar(dataToPass, null);\n            }, 100);\n        }\n    },\n    onRuntimeInitialized: function() {\n    },\n    locateFile: function(file) {\n        return '" +
                            e +
                            "';\n    }\n};\n" +
                            s.data +
                            '\nlet unrar = function(data, password) {\n    let cb = function(fileName, fileSize, progress) {\n        postMessage({"t":4,"current":progress,"total":fileSize, "name": fileName});\n    };\n\n    let rarContent = readRARContent(data.map(function(d) {\n        return {\n            name: d.name,\n            content: new Uint8Array(d.content)\n        }\n    }), password, cb)\n    let rec = function(entry) {\n        if (!entry) return;\n        if (entry.type === \'file\') {\n            postMessage({"t":2,"file":entry.fullFileName,"size":entry.fileSize,"data":entry.fileContent});\n        } else if (entry.type === \'dir\') {\n            Object.keys(entry.ls).forEach(function(k) {\n                rec(entry.ls[k]);\n            })\n        } else {\n            throw "Unknown type";\n        }\n    }\n    rec(rarContent);\n    postMessage({"t":1});\n    return rarContent;\n};\nonmessage = function(data) {\n    dataToPass.push({name:  \'test.rar\', content: data.data});\n};\n                ';
                        t(new Blob([o], { type: "application/javascript" }));
                    }
                } else t(new Blob([s.data], { type: "application/javascript" }));
            });
        }
        decompressFile(t, s, o, l) {
            return new Promise(async (i) => {
                var e = await this.getWorkerFile(t),
                    e = new Worker(URL.createObjectURL(e));
                let n = {};
                (e.onmessage = (e) => {
                    if (e.data) {
                        if (4 === e.data.t) {
                            var t = e.data,
                                t = Math.floor((t.current / t.total) * 100);
                            if (isNaN(t)) return;
                            t = " " + t.toString() + "%";
                            o(t, !0);
                        }
                        2 === e.data.t && ("function" == typeof l ? (l(e.data.file, e.data.data), (n[e.data.file] = !0)) : (n[e.data.file] = e.data.data)), 1 === e.data.t && i(n);
                    }
                }),
                    e.postMessage(s);
            });
        }
    };
})();
