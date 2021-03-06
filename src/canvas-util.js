// Contains various canvas utility methods.

(function(exports) {

    const CanvasUtil = {};

    // Constructs a path on a <canvas>, given a Region.
    CanvasUtil.pathFromRegion = function(ctx, region) {
        region.iter_rectangles(function(x, y, width, height) {
            ctx.rect(x, y, width, height);
        });
    };

    // Workaround for browser bugs in drawImage when the source and
    // destination <canvas> images are the same:
    //
    //   https://bugzilla.mozilla.org/show_bug.cgi?id=842110
    //   https://code.google.com/p/chromium/issues/detail?id=176714
    CanvasUtil.copyArea = function(ctx, srcX, srcY, destX, destY, w, h) {
        if (srcX + w < 0 || srcX > ctx.canvas.width)
            return;

        if (destX + w < 0 || destX > ctx.canvas.width)
            return;

        if (srcY + h < 0 || srcY > ctx.canvas.height)
            return;

        if (destY + h < 0 || destY > ctx.canvas.height)
            return;

        if (destX < 0) {
            w += destX;
            srcX -= destX;
            destX = 0;
        }

        if (srcX < 0) {
            destX -= srcX;
            w += srcX;
            srcX = 0;
        }

        if (destY < 0) {
            h += destY;
            srcY -= destY;
            destY = 0;
        }

        if (srcY < 0) {
            destY -= srcY;
            h += srcY;
            srcY = 0;
        }

        const mX = Math.max(srcX, destX);
        if (mX >= ctx.canvas.width)
            return;

        if (mX + w > ctx.canvas.width)
            w = ctx.canvas.width - mX;

        const mY = Math.max(srcY, destY);
        if (mY >= ctx.canvas.height)
            return;

        if (mY + h > ctx.canvas.height)
            h = ctx.canvas.height - mY;

        ctx.drawImage(ctx.canvas, srcX, srcY, w, h, destX, destY, w, h);
    };

    CanvasUtil.visibleRAF = function(elem, func, activateFunc) {
        let isRunning = false;
        function setRunning(running) {
            if (isRunning == running)
                return;

            isRunning = running;

            if (activateFunc)
                activateFunc(isRunning);

            if (isRunning)
                window.requestAnimationFrame(update);
        }

        function update(t) {
            func(t);

            if (isRunning)
                window.requestAnimationFrame(update);
        }

        function visibleRAF_impl_onscroll() {
            function isElemVisible(elem) {
                const rect = elem.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight)
                    return false;
                return true;
            }

            function scrollHandler() {
                setRunning(isElemVisible(elem));
            }

            document.addEventListener('scroll', scrollHandler);
            scrollHandler();
        }

        function visibleRAF_impl_IntersectionObserver() {
            function callback(entries) {
                const { intersectionRatio } = entries[0];
                const shouldBeRunning = intersectionRatio > 0;
                setRunning(shouldBeRunning);
            }

            const observer = new IntersectionObserver(callback);
            observer.observe(elem);
        }

        if (window.IntersectionObserver)
            visibleRAF_impl_IntersectionObserver();
        else
            visibleRAF_impl_onscroll();
    };

    exports.CanvasUtil = CanvasUtil;

})(window);
