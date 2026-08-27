(() => {
    "use strict";

    const $ = (selector) => document.querySelector(selector);

    const backgroundImage = $("#backgroundImage");
    const blackFade = $("#blackFade");

    const clock = $("#clock");
    const countdown = $("#countdown");

    const profileButton = $("#profileButton");
    const profileCard = $("#profileCard");
    const profileOverlay = $("#profileOverlay");
    const closeProfile = $("#closeProfile");

    const playlistPanel = $("#playlistPanel");
    const playlistOverlay = $("#playlistOverlay");
    const closePlaylist = $("#closePlaylist");
    const playAllButton = $("#playAllButton");
    const searchInput = $("#searchInput");
    const trackList = $("#trackList");
    const trackCount = $("#trackCount");

    const player = $("#player");
    const audio = $("#audio");
    const radioArt = $("#radioArt");
    const currentTitle = $("#currentTitle");
    const currentArtist = $("#currentArtist");
    const currentTime = $("#currentTime");
    const duration = $("#duration");
    const progress = $("#progress");

    const playButton = $("#playButton");
    const playLabel = $("#playLabel");
    const playIcon = $("#playIcon");
    const prevButton = $("#prevButton");
    const nextButton = $("#nextButton");
    const loopButton = $("#loopButton");

    const btnParaaPlaylist = $("#btnParaaPlaylist");
    const btnAarati = $("#btnAarati");
    const btnDhak = $("#btnDhak");
    const aaratiLockIcon = $("#aaratiLockIcon");

    const toast = $("#toast");
    const liveCount = $("#liveCount");

    const mobile = window.matchMedia("(max-width: 760px)");
    const tablet = window.matchMedia("(min-width: 761px) and (max-width: 1024px)");

    /* =====================================================
       TIME-BASED IMAGES
       ===================================================== */

    const SCENES = [
        { start: 0, end: 2, desktop: "images/1030pm_adda_desktop.png", mobile: "images/1030pm_adda_mobile.png" },
        { start: 2, end: 8, desktop: "images/0200am_goodnight_desktop.png", mobile: "images/0200am_goodnight_mobile.png" },
        { start: 8, end: 10, desktop: "images/0800am_morning_desktop.png", mobile: "images/0800am_morning_mobile.png" },
        { start: 10, end: 13, desktop: "images/1000am_anjali_desktop.png", mobile: "images/1000am_anjali_mobile.png" },
        { start: 13, end: 16, desktop: "images/0100pm_bhog_desktop.png", mobile: "images/0100pm_bhog_mobile.png" },
        { start: 16, end: 18.5, desktop: "images/0430pm_quiet_desktop.png", mobile: "images/0430pm_quiet_mobile.png" },
        { start: 18.5, end: 20.5, desktop: "images/0630pm_aarti_desktop.png", mobile: "images/0630pm_aarti_mobile.png" },
        { start: 20.5, end: 22.5, desktop: "images/0830pm_cultural_desktop.png", mobile: "images/0830pm_cultural_mobile.png" },
        { start: 22.5, end: 24, desktop: "images/1030pm_adda_desktop.png", mobile: "images/1030pm_adda_mobile.png" }
    ];

    let activeBackground = "";

    function currentDecimalHour() {
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    }

    function activeScene() {
        const hour = currentDecimalHour();

        for (const scene of SCENES) {
            if (hour >= scene.start && hour < scene.end) {
                return scene;
            }
        }

        return SCENES[SCENES.length - 1];
    }

    function sceneSource(scene) {
        if (mobile.matches) return scene.mobile;
        if (tablet.matches) return scene.tab || scene.mobile;
        return scene.desktop;
    }

    function preload(src) {
        const image = new Image();
        image.src = src;
    }

    function loadBackground(src, done) {
        const image = new Image();

        image.onload = () => done(true);
        image.onerror = () => {
            console.error("Background image could not be loaded:", src);
            done(false);
        };

        image.src = src;
    }

    function switchBackground(force = false) {
        const scene = activeScene();
        const src = sceneSource(scene);

        if (!force && src === activeBackground) return;

        loadBackground(src, (ok) => {
            if (!ok) {
                /*
                 * Never hide the current background when a new file is missing.
                 * The existing scene stays visible instead of turning black.
                 */
                return;
            }

            backgroundImage.classList.add("is-fading");

            window.setTimeout(() => {
                backgroundImage.src = src;
                activeBackground = src;

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        backgroundImage.classList.remove("is-fading");
                    });
                });

                const index = SCENES.indexOf(scene);
                const nextScene = SCENES[(index + 1) % SCENES.length];
                preload(sceneSource(nextScene));
            }, force ? 0 : 280);
        });
    }

    mobile.addEventListener?.("change", () => switchBackground(true));
    tablet.addEventListener?.("change", () => switchBackground(true));

    document.addEventListener("contextmenu", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("img")) {
            event.preventDefault();
        }
    });

    /* =====================================================
       CLOCK + COUNTDOWN
       ===================================================== */

    const PUJO_START = new Date(2026, 9, 16, 0, 0, 0);

    function updateTime() {
        const now = new Date();

        clock.textContent = now.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        const diff = PUJO_START - now;

        if (diff > 0) {
            const days = Math.ceil(diff / 86400000);
            countdown.textContent = `${days} ${days === 1 ? "DAY" : "DAYS"} TO PUJO`;
        } else {
            countdown.textContent = "PUJO IS HERE";
        }
    }

    /* =====================================================
       MONTHLY LIVE LISTENER COUNT (Base 94, +2 to +5/month)
       ===================================================== */

    function getMonthlyLiveCount() {
        const BASE_COUNT = 94;
        const BASE_YEAR = 2026;
        const BASE_MONTH = 7; // August (0-indexed)

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthsDiff = (currentYear - BASE_YEAR) * 12 + (currentMonth - BASE_MONTH);

        if (monthsDiff <= 0) {
            return BASE_COUNT;
        }

        const MONTHLY_INCREMENTS = [3, 4, 3, 5, 2, 4, 3, 5, 3, 4, 2, 5];
        let totalIncrement = 0;

        for (let i = 0; i < monthsDiff; i++) {
            totalIncrement += MONTHLY_INCREMENTS[i % MONTHLY_INCREMENTS.length];
        }

        return BASE_COUNT + totalIncrement;
    }

    function refreshLiveCount() {
        if (!liveCount) return;
        liveCount.textContent = String(getMonthlyLiveCount());
    }

    /* =====================================================
       PROFILE
       ===================================================== */

    function setProfile(open) {
        profileCard.classList.toggle("is-open", open);
        profileOverlay.classList.toggle("is-open", open);

        profileCard.setAttribute("aria-hidden", String(!open));
        profileButton.setAttribute("aria-expanded", String(open));

        if (open) setPlaylist(false);
    }

    profileButton.addEventListener("click", () => {
        setProfile(!profileCard.classList.contains("is-open"));
    });

    closeProfile.addEventListener("click", () => setProfile(false));
    profileOverlay.addEventListener("click", () => setProfile(false));

    /* =====================================================
       PLAYLIST
       ===================================================== */

    let currentIndex = TRACKS.findIndex((track) => track.file);
    if (currentIndex < 0) currentIndex = 0;

    let loop = true;
    let toastTimer;

    function setPlaylist(open) {
        playlistPanel.classList.toggle("is-open", open);
        playlistOverlay.classList.toggle("is-open", open);

        playlistPanel.setAttribute("aria-hidden", String(!open));
        if (btnParaaPlaylist) btnParaaPlaylist.setAttribute("aria-expanded", String(open));

        if (open) setProfile(false);
    }

    closePlaylist.addEventListener("click", () => setPlaylist(false));
    playlistOverlay.addEventListener("click", () => setPlaylist(false));

    function visibleTracks() {
        const query = searchInput.value.trim().toLowerCase();

        return TRACKS
            .map((track, index) => ({ track, index }))
            .filter(({ track }) => {
                if (!query) return true;

                return `${track.title} ${track.singer} ${track.year}`
                    .toLowerCase()
                    .includes(query);
            });
    }

    function renderTracks() {
        const rows = visibleTracks();

        trackList.replaceChildren();
        trackCount.textContent = `${rows.length} ${rows.length === 1 ? "song" : "songs"}`;

        if (!rows.length) {
            const empty = document.createElement("div");
            empty.className = "empty-row";
            empty.textContent = "No matching songs";
            trackList.appendChild(empty);
            return;
        }

        rows.forEach(({ track, index }, visibleIndex) => {
            const row = document.createElement("button");
            row.type = "button";
            row.className = `track-row${index === currentIndex ? " is-active" : ""}`;

            const number = document.createElement("span");
            number.className = "track-number";
            number.textContent =
                index === currentIndex && !audio.paused
                    ? "●"
                    : String(visibleIndex + 1).padStart(2, "0");

            const title = document.createElement("span");
            title.className = "track-title";
            title.textContent = track.title;

            const artist = document.createElement("span");
            artist.className = "track-artist";
            artist.textContent = track.singer;

            const year = document.createElement("span");
            year.className = "track-year";
            year.textContent = track.year;

            row.append(number, title, artist, year);

            row.addEventListener("click", () => playTrack(index));

            trackList.appendChild(row);
        });
    }

    searchInput.addEventListener("input", renderTracks);

    playAllButton.addEventListener("click", () => {
        const first = visibleTracks().find(({ track }) => track.file);

        if (!first) {
            showToast("No playable song in this selection");
            return;
        }

        playTrack(first.index);
    });

    /* =====================================================
       PLAYER MODES & CONTROLLER (Paraa Playlist, Aarati, Dhak)
       ===================================================== */

    let currentMode = "playlist"; // 'playlist' | 'aarati' | 'dhak'

    const MODE_TRACKS = {
        aarati: {
            title: "Sandhya Aarati",
            singer: "Paara Pujo Aarati",
            file: "audio/AARATI.mp3",
            artwork: "images/aarati.png"
        },
        dhak: {
            title: "Dhak Beats",
            singer: "Traditional Pujo Dhak",
            file: "audio/DHAK.mp3",
            artwork: "images/dhak.png"
        }
    };

    function isAaratiAvailable() {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        return minutes >= (18 * 60 + 30); // 18:30 = 1110 minutes
    }

    function updateAaratiLockUI() {
        const available = isAaratiAvailable();
        if (btnAarati) {
            btnAarati.classList.toggle("is-locked", !available);
        }
        if (aaratiLockIcon) {
            aaratiLockIcon.style.display = available ? "none" : "inline";
        }
    }

    function showCustomToast({ title, message, icon }) {
        if (!toast) return;

        toast.replaceChildren();

        if (icon) {
            const iconImg = document.createElement("img");
            iconImg.className = "toast__icon";
            iconImg.src = icon;
            iconImg.alt = "";
            toast.appendChild(iconImg);
        }

        const content = document.createElement("div");
        content.className = "toast__content";

        const titleEl = document.createElement("div");
        titleEl.className = "toast__title";
        titleEl.textContent = title;

        const msgEl = document.createElement("div");
        msgEl.className = "toast__message";
        msgEl.textContent = message;

        content.append(titleEl, msgEl);
        toast.appendChild(content);

        toast.classList.add("is-visible");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 3500);
    }

    function showSimpleToast(message) {
        showCustomToast({
            title: message,
            message: "",
            icon: null
        });
    }

    /* =====================================================
       MEDIA SESSION & SAFE AUDIO ENGINE (FOR SMOOTH BG PLAYBACK)
       ===================================================== */

    let pendingAutoPlay = false;

    function getSafeAudioUrl(file) {
        if (!file) return "";
        return encodeURI(file);
    }

    async function safePlayAudio() {
        try {
            pendingAutoPlay = false;
            await audio.play();
        } catch (error) {
            console.warn("Playback waiting for buffer/activation:", error);
            pendingAutoPlay = true;
        }
    }

    audio.addEventListener("canplay", () => {
        if (pendingAutoPlay && audio.paused) {
            safePlayAudio();
        }
    });

    document.addEventListener("touchstart", () => {
        if (pendingAutoPlay && audio.paused) {
            safePlayAudio();
        }
    }, { passive: true });

    document.addEventListener("click", () => {
        if (pendingAutoPlay && audio.paused) {
            safePlayAudio();
        }
    }, { passive: true });

    function updateMediaSession() {
        if (!('mediaSession' in navigator)) return;

        let title = "";
        let artist = "";
        let artworkSrc = "images/favicon.png";

        if (currentMode === "playlist") {
            const track = TRACKS[currentIndex];
            if (track) {
                title = track.title;
                artist = `${track.singer} · ${track.year}`;
            }
        } else {
            const modeData = MODE_TRACKS[currentMode];
            if (modeData) {
                title = modeData.title;
                artist = modeData.singer;
                artworkSrc = modeData.artwork;
            }
        }

        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title || "Paara Pujo Radio",
                artist: artist || "Pujo Radio",
                album: "Paara Pujo Radio",
                artwork: [
                    { src: artworkSrc, sizes: "512x512", type: "image/png" }
                ]
            });
        } catch (e) {
            console.warn("MediaSession metadata error:", e);
        }
    }

    function setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        try {
            navigator.mediaSession.setActionHandler('play', () => {
                togglePlay();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                togglePlay();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                if (currentMode === "playlist") {
                    if (audio.currentTime > 3) {
                        audio.currentTime = 0;
                        return;
                    }
                    const idx = nextIndex(-1);
                    if (idx >= 0) playTrack(idx, true);
                } else {
                    audio.currentTime = 0;
                }
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (currentMode === "playlist") {
                    const idx = nextIndex(1);
                    if (idx >= 0) playTrack(idx, true);
                } else {
                    audio.currentTime = 0;
                }
            });
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.fastSeek && 'fastSeek' in audio) {
                    audio.fastSeek(details.seekTime);
                    return;
                }
                audio.currentTime = details.seekTime;
            });
        } catch (e) {
            console.warn("MediaSession action handler error:", e);
        }
    }

    async function setPlayerMode(mode) {
        const wasPlaying = !audio.paused;

        if (mode === currentMode) {
            if (mode === "playlist") {
                setPlaylist(!playlistPanel.classList.contains("is-open"));
            }
            return;
        }

        audio.pause();
        currentMode = mode;

        if (btnParaaPlaylist) btnParaaPlaylist.classList.toggle("is-active", mode === "playlist");
        if (btnAarati) btnAarati.classList.toggle("is-active", mode === "aarati");
        if (btnDhak) btnDhak.classList.toggle("is-active", mode === "dhak");

        if (mode === "playlist") {
            if (radioArt) radioArt.src = "images/favicon.png";
            prevButton.disabled = false;
            nextButton.disabled = false;
            prevButton.style.opacity = "1";
            nextButton.style.opacity = "1";
            setTrackText();
            audio.src = getSafeAudioUrl(TRACKS[currentIndex].file);
            audio.preload = "auto";
        } else {
            const modeData = MODE_TRACKS[mode];
            if (!modeData) return;

            if (radioArt) radioArt.src = modeData.artwork;
            currentTitle.textContent = modeData.title;
            currentArtist.textContent = modeData.singer;

            prevButton.disabled = true;
            nextButton.disabled = true;
            prevButton.style.opacity = "0.5";
            nextButton.style.opacity = "0.5";

            audio.src = getSafeAudioUrl(modeData.file);
            audio.preload = "auto";
        }

        progress.value = 0;
        progress.style.setProperty("--pct", "0%");
        currentTime.textContent = "0:00";
        duration.textContent = "0:00";

        updateMediaSession();

        if (wasPlaying) {
            await safePlayAudio();
        }
    }

    if (btnParaaPlaylist) {
        btnParaaPlaylist.addEventListener("click", () => setPlayerMode("playlist"));
    }

    if (btnAarati) {
        btnAarati.addEventListener("click", () => {
            if (!isAaratiAvailable()) {
                showCustomToast({
                    title: "Sandhya Aarati begins at 6:30 PM",
                    message: "Come back this evening for the paraa aarati.",
                    icon: "images/aarati.png"
                });
                return;
            }
            setPlayerMode("aarati");
        });
    }

    if (btnDhak) {
        btnDhak.addEventListener("click", () => setPlayerMode("dhak"));
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, "0");

        return `${minutes}:${secs}`;
    }

    function setTrackText() {
        const track = TRACKS[currentIndex];
        if (!track) return;

        currentTitle.textContent = track.title;
        currentArtist.textContent = `${track.singer} · ${track.year}`;
        renderTracks();
    }

    function setPlaying(playing) {
        player.classList.toggle("is-playing", playing);
        playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
        playLabel.textContent = playing ? "PAUSE" : "PLAY";
        playIcon.textContent = playing ? "Ⅱ" : "▶";
    }

    async function playTrack(index, autoPlay = true) {
        const track = TRACKS[index];

        if (!track?.file) {
            showSimpleToast("Audio file not added");
            return;
        }

        if (currentMode !== "playlist") {
            currentMode = "playlist";
            if (btnParaaPlaylist) btnParaaPlaylist.classList.add("is-active");
            if (btnAarati) btnAarati.classList.remove("is-active");
            if (btnDhak) btnDhak.classList.remove("is-active");
            if (radioArt) radioArt.src = "images/favicon.png";
            prevButton.disabled = false;
            nextButton.disabled = false;
            prevButton.style.opacity = "1";
            nextButton.style.opacity = "1";
        }

        const targetSrc = getSafeAudioUrl(track.file);
        const currentSrc = audio.getAttribute("src");
        const changed = index !== currentIndex || !currentSrc || (currentSrc !== targetSrc && currentSrc !== track.file);

        currentIndex = index;
        setTrackText();

        if (changed) {
            audio.src = targetSrc;
            audio.preload = "auto";
            progress.value = 0;
            progress.style.setProperty("--pct", "0%");
            currentTime.textContent = "0:00";
            duration.textContent = "0:00";
        }

        updateMediaSession();

        if (autoPlay) {
            await safePlayAudio();
        }
    }

    async function togglePlay() {
        if (!audio.getAttribute("src")) {
            if (currentMode === "playlist") {
                await playTrack(currentIndex, true);
            } else {
                audio.src = getSafeAudioUrl(MODE_TRACKS[currentMode]?.file || TRACKS[0].file);
                audio.preload = "auto";
                updateMediaSession();
                await safePlayAudio();
            }
            return;
        }

        if (audio.paused) {
            await safePlayAudio();
        } else {
            pendingAutoPlay = false;
            audio.pause();
        }
    }

    function playableIndexes() {
        return TRACKS
            .map((track, index) => track.file ? index : -1)
            .filter((index) => index >= 0);
    }

    function nextIndex(direction) {
        if (currentMode !== "playlist") return -1;

        const playable = playableIndexes();
        const position = playable.indexOf(currentIndex);

        if (!playable.length) return -1;

        if (position < 0) return playable[0];

        let next = position + direction;

        if (next >= playable.length) {
            if (!loop) return -1;
            next = 0;
        }

        if (next < 0) {
            next = loop ? playable.length - 1 : 0;
        }

        return playable[next];
    }

    playButton.addEventListener("click", togglePlay);

    prevButton.addEventListener("click", () => {
        if (currentMode !== "playlist") {
            audio.currentTime = 0;
            return;
        }

        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const index = nextIndex(-1);
        if (index >= 0) playTrack(index, true);
    });

    nextButton.addEventListener("click", () => {
        if (currentMode !== "playlist") {
            audio.currentTime = 0;
            return;
        }

        const index = nextIndex(1);
        if (index >= 0) playTrack(index, true);
    });

    loopButton.addEventListener("click", () => {
        loop = !loop;
        loopButton.classList.toggle("is-active", loop);
        loopButton.setAttribute("aria-pressed", String(loop));
    });

    audio.addEventListener("play", () => {
        setPlaying(true);
        if (currentMode === "playlist") renderTracks();
        if ('mediaSession' in navigator) {
            try { navigator.mediaSession.playbackState = 'playing'; } catch (e) {}
        }
    });

    audio.addEventListener("pause", () => {
        setPlaying(false);
        if (currentMode === "playlist") renderTracks();
        if ('mediaSession' in navigator) {
            try { navigator.mediaSession.playbackState = 'paused'; } catch (e) {}
        }
    });

    audio.addEventListener("ended", () => {
        if (currentMode === "playlist") {
            const index = nextIndex(1);
            if (index >= 0) {
                playTrack(index, true);
            } else {
                setPlaying(false);
            }
        } else {
            setPlaying(false);
        }
    });

    audio.addEventListener("loadedmetadata", () => {
        duration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        currentTime.textContent = formatTime(audio.currentTime);

        const percent = audio.duration
            ? (audio.currentTime / audio.duration) * 1000
            : 0;

        progress.value = percent;
        progress.style.setProperty("--pct", `${percent / 10}%`);

        if ('mediaSession' in navigator && audio.duration) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: audio.currentTime
                });
            } catch (e) {}
        }
    });

    progress.addEventListener("input", () => {
        if (!audio.duration) return;

        audio.currentTime =
            (Number(progress.value) / 1000) * audio.duration;
    });

    audio.addEventListener("error", () => {
        showSimpleToast("Audio file could not be loaded");
    });

    /* =====================================================
       KEYBOARD
       ===================================================== */

    document.addEventListener("keydown", (event) => {
        const typing =
            document.activeElement?.tagName === "INPUT";

        if (event.key === "Escape") {
            setProfile(false);
            setPlaylist(false);
        }

        if (event.code === "Space" && !typing) {
            event.preventDefault();
            togglePlay();
        }
    });

    /* =====================================================
       START
       ===================================================== */

    setupMediaSession();
    setTrackText();
    setPlaying(false);

    updateTime();
    updateAaratiLockUI();
    refreshLiveCount();
    switchBackground(true);

    setInterval(updateTime, 1000);
    setInterval(updateAaratiLockUI, 10000);
    setInterval(refreshLiveCount, 86400000); // Check for monthly count update daily
    setInterval(switchBackground, 30000);

})();
