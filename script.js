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

    const playlistButton = $("#playlistButton");
    const playlistPanel = $("#playlistPanel");
    const playlistOverlay = $("#playlistOverlay");
    const closePlaylist = $("#closePlaylist");
    const playAllButton = $("#playAllButton");
    const searchInput = $("#searchInput");
    const trackList = $("#trackList");
    const trackCount = $("#trackCount");

    const player = $("#player");
    const audio = $("#audio");
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

    const toast = $("#toast");
    const liveCount = $("#liveCount");

    const mobile = window.matchMedia("(max-width: 760px)");

    /* =====================================================
       TIME-BASED IMAGES
       ===================================================== */

    const SCENES = [
        {
            start: 0,
            desktop: "images/1030pm_adda_desktop.png",
            mobile: "images/1030pm_adda_mobile.png"
        },
        {
            start: 2,
            desktop: "images/0200am_goodnight_desktop.png",
            mobile: "images/0200am_goodnight_mobile.png"
        },
        {
            start: 8,
            desktop: "images/0800am_morning_desktop.png",
            mobile: "images/0800am_morning_mobile.png"
        },
        {
            start: 10,
            desktop: "images/1000am_anjali_desktop.png",
            mobile: "images/1000am_anjali_mobile.png"
        },
        {
            start: 13,
            desktop: "images/0100pm_bhog_desktop.png",
            mobile: "images/0100pm_bhog_mobile.png"
        },
        {
            start: 16.5,
            desktop: "images/0430pm_quiet_desktop.png",
            mobile: "images/0430pm_quiet_mobile.png"
        },
        {
            start: 18.5,
            desktop: "images/0630pm_aarti_desktop.png",
            mobile: "images/0630pm_aarti_mobile.png"
        },
        {
            start: 20.5,
            desktop: "images/0830pm_cultural_desktop.png",
            mobile: "images/0830pm_cultural_mobile.png"
        },
        {
            start: 22.5,
            desktop: "images/1030pm_adda_desktop.png",
            mobile: "images/1030pm_adda_mobile.png"
        }
    ];

    let activeBackground = "";

    function currentDecimalHour() {
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    }

    function activeScene() {
        const hour = currentDecimalHour();
        let selected = SCENES[0];

        for (const scene of SCENES) {
            if (hour >= scene.start) selected = scene;
            else break;
        }

        return selected;
    }

    function sceneSource(scene) {
        return mobile.matches ? scene.mobile : scene.desktop;
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

    function updateLiveCount() {
        const nextValue = Math.floor(Math.random() * 21) + 18;
        liveCount.textContent = String(nextValue);
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
        playlistButton.setAttribute("aria-expanded", String(open));

        if (open) setProfile(false);
    }

    playlistButton.addEventListener("click", () => {
        setPlaylist(!playlistPanel.classList.contains("is-open"));
    });

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
       AUDIO PLAYER
       ===================================================== */

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, "0");

        return `${minutes}:${secs}`;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("is-visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2000);
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

    async function playTrack(index) {
        const track = TRACKS[index];

        if (!track?.file) {
            showToast("Audio file not added");
            return;
        }

        const changed = index !== currentIndex || !audio.getAttribute("src");

        currentIndex = index;
        setTrackText();

        if (changed) {
            audio.src = track.file;
            progress.value = 0;
            progress.style.setProperty("--pct", "0%");
            currentTime.textContent = "0:00";
            duration.textContent = "0:00";
        }

        try {
            await audio.play();
        } catch (error) {
            console.error(error);
            showToast(`Could not play ${track.title}`);
        }
    }

    async function togglePlay() {
        const track = TRACKS[currentIndex];

        if (!track?.file) {
            showToast("No playable audio");
            return;
        }

        if (!audio.getAttribute("src")) {
            await playTrack(currentIndex);
            return;
        }

        if (audio.paused) {
            try {
                await audio.play();
            } catch {
                showToast("Could not play audio");
            }
        } else {
            audio.pause();
        }
    }

    function playableIndexes() {
        return TRACKS
            .map((track, index) => track.file ? index : -1)
            .filter((index) => index >= 0);
    }

    function nextIndex(direction) {
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
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const index = nextIndex(-1);
        if (index >= 0) playTrack(index);
    });

    nextButton.addEventListener("click", () => {
        const index = nextIndex(1);
        if (index >= 0) playTrack(index);
    });

    loopButton.addEventListener("click", () => {
        loop = !loop;
        loopButton.classList.toggle("is-active", loop);
        loopButton.setAttribute("aria-pressed", String(loop));
    });

    audio.addEventListener("play", () => {
        setPlaying(true);
        renderTracks();
    });

    audio.addEventListener("pause", () => {
        setPlaying(false);
        renderTracks();
    });

    audio.addEventListener("ended", () => {
        const index = nextIndex(1);

        if (index >= 0) {
            playTrack(index);
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
    });

    progress.addEventListener("input", () => {
        if (!audio.duration) return;

        audio.currentTime =
            (Number(progress.value) / 1000) * audio.duration;
    });

    audio.addEventListener("error", () => {
        showToast("Audio file could not be loaded");
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

    setTrackText();
    setPlaying(false);

    updateTime();
    switchBackground(true);

    setInterval(updateTime, 1000);
    setInterval(switchBackground, 30000);

})();
