(function() {
    alert('100');
    document.addEventListener('DOMContentLoaded', function() { /*3*/
        document.body.addEventListener('click', function() {
            alert('body click');
        })
    }, false);
})();