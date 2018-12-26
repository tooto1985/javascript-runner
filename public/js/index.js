(function() {

    alert('200');

    document.addEventListener('DOMContentLoaded', function() {

        document.body.addEventListener('click', function() {

            alert('body click');

        })

    }, false);

})();
