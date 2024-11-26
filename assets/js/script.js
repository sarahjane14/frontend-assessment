//DatePicker
$(document).ready(function () {
    $("#datepicker").datepicker({
        dateFormat: "MM yy",
        changeMonth: true,
        changeYear: true,
    }); // Set an initial value (optional)
    $("#datepicker").val($.datepicker.formatDate("MM yy", new Date()));
});

//Responsive Sidebar
$(document).ready(function () {
    $(".toggle-btn").click(function () {
        $("#mySidebar").toggleClass("closed");
        if ($(window).width() <= 880) {
            $("#mySidebar").toggleClass("open");
        }
    });
});

//Leave Datatable+
$(function () {
    // Initialize the DataTable
    var table = $("#leaveRequest").DataTable({
        pageLength: 3,
        searching: false,
        lengthChange: false,
        paging: true,
        info: true,
        language: {
            info: "_START_ - _END_ OF _TOTAL_",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total records)",
        },
    });

    // Premade test data URL
    var testDataUrl =
        "https://gist.githubusercontent.com/sarahjane14/7b92d935b067aed9323e2be12e16682f/raw/d3f3dbd241c50c2298a17b3044389af9fafe08cd/gistfile1.json";
    // Immediately load data on page load
    loadData();

    function loadData() {
        $.ajax({
            type: "GET",
            url: testDataUrl,
            contentType: "text/plain",
            dataType: "json",
            success: function (data) {
                myJsonData = data;
                populateDataTable(myJsonData);
            },
            error: function (e) {
                console.log("There was an error with your request...");
                console.log("error: " + JSON.stringify(e));
            },
        });
    }

    // Function to format the period (assuming period is an object with `start` and `end` keys)
    function formatPeriod(period) {
        if (!period || !period.start || !period.end) {
            return "Invalid Period";
        }

        function formatDateTime(dateString) {
            const date = new Date(dateString);

            // Manually format the date
            const day = date.getDate().toString().padStart(2, "0");
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();

            // Format the time
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12; // Convert to 12-hour format, 0 becomes 12

            return `${day} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
        }
        // Format start and end dates
        const formattedStart = formatDateTime(period.start);
        const formattedEnd = formatDateTime(period.end);

        // Combine with a line break
        return `${formattedStart}<br>${formattedEnd}`;
    }

    // Populate the data table with JSON data
    function populateDataTable(data) {
        console.log("Populating data table...");
        // Clear the table before populating it with more data
        table.clear().draw();

        var length = Object.keys(data.requests).length;
        for (var i = 1; i < length + 1; i++) {
            var request = data.requests["request" + i];

            // Format the period
            const formattedPeriod = formatPeriod(request.period);

            const avatarHtml = `<img src="${request.avatar}" alt="${request.name}'s avatar" class="avatar" />`;

            // Add data to the table
            table.row.add([
                `<label class="custom-checkbox">
                <input type="checkbox" class="row-checkbox">
                <span class="checkmark"></span>
                </label><div class="yellow-sign"></div>`,
                `${avatarHtml} <span>${request.name}</span>`,
                formattedPeriod,
                request.days,
                request.leave_type,
                request.actions,
            ]);
        }

        // Redraw the table after adding rows
        table.draw();

        // Add event listener for the "Select All" checkbox in the header
        $("#leaveRequest thead").on("change", "#selectAll", function () {
            var isChecked = $(this).is(":checked");
            $("#leaveRequest tbody .row-checkbox").each(function () {
                $(this).prop("checked", isChecked).trigger("change");
            });
        });

        // Add a change event listener for the checkboxes
        $("#leaveRequest tbody").on("change", ".row-checkbox", function () {
            // Toggle row background based on checkbox state
            var $row = $(this).closest("tr");
            if (this.checked) {
                $row.addClass("checked-row");
            } else {
                $row.removeClass("checked-row");
            }

            // Update the "Select All" checkbox based on individual checkboxes
            var allChecked =
                $(".row-checkbox").length === $(".row-checkbox:checked").length;
            $("#selectAll").prop("checked", allChecked);
        });

        // Show modal and update it based on action (reject or approve)
        $("#leaveRequest tbody").on("click", ".reject-btn", function () {
            const rowData = table.row($(this).parents("tr")).data();

            // Update the modal content
            $("#modalTtitle").text("Confirmation");
            $("#modalMessage").text(
                `Are you sure want to rejceted ${request.name} ${rowData[4]} for 1 day? `
            );
            $("#confirmAction").text("Yes");
            $("#confirmAction")
                .off("click")
                .on("click", function () {
                    // Implement your save logic here (e.g., save the updated data)
                    console.log("Saving changes for:", rowData);
                    closeModal();
                });

            // Show the modal
            openModal();
        });

        $("#leaveRequest tbody").on("click", ".approve-btn", function () {
            const rowData = table.row($(this).parents("tr")).data();

            // Update the modal content
            $("#modalTitle").text("Delete Request");
            $("#modalMessage").text(
                `Are you sure want to approved ${request.name} ${rowData[4]} for 1 day? `
            );
            $("#confirmAction").text("Yes");
            $("#confirmAction")
                .off("click")
                .on("click", function () {
                    // Implement your delete logic here (e.g., delete the request)
                    console.log("Saving request for:", rowData);
                    closeModal();
                });

            // Show the modal
            openModal();
        });

        // Function to open the modal
        function openModal() {
            $("#actionModal").fadeIn();
        }

        // Function to close the modal
        function closeModal() {
            $("#actionModal").fadeOut();
        }

        // Close the modal when the user clicks the "x"
        $(".close-btn").on("click", function () {
            closeModal();
        });

        // Close the modal when the user clicks the cancel button
        $("#cancelAction").on("click", function () {
            closeModal();
        });
    }
});

// Initialize select2 dropdown
$(document).ready(function () {
    $(".leave-type").select2({
        closeOnSelect: false,
    });
});

// Initialize Flatpickr for month and year selection
flatpickr("#monthYearPicker", {
    plugins: [
        new monthSelectPlugin({
            // Use the month select plugin
            shorthand: true, // Display short month names
            dateFormat: "F Y", // Format as "January 2024"
            altInput: true, // Add an alternative input field
        }),
    ],
});

//Initialize Days
function openDay(evt, dayDisplay) {
    // Declare all variables
    var i, tabcontent, tabdays;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tabdays" and remove the class "active"
    tabdays = document.getElementsByClassName("tabdays");
    for (i = 0; i < tabdays.length; i++) {
        tabdays[i].className = tabdays[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(dayDisplay).style.display = "block";
    evt.currentTarget.className += " active";

    // Save the active tab to localStorage
    localStorage.setItem("activeTab", dayDisplay);
}

// Function to load the active tab on page reload
function loadActiveTab() {
    const activeTab = localStorage.getItem("activeTab");
    if (activeTab) {
        const activeTabButton = document.querySelector(
            `[data-day="${activeTab}"]`
        );
        if (activeTabButton) {
            activeTabButton.click(); // Simulate a click to activate the saved tab
        }
    } else {
        // Default tab if no active tab is saved
        const defaultTabButton = document.querySelector(`[data-day]`);
        if (defaultTabButton) {
            defaultTabButton.click();
        }
    }
}

// Call loadActiveTab on page load
document.addEventListener("DOMContentLoaded", loadActiveTab);

//Initialize of Leave Percentage
$(".box-circle").each(function () {
    let i = 0,
        that = $(this),
        circleBorder = that.find(".circle-border"),
        borderColor = circleBorder.data("color1"),
        animationColor = circleBorder.data("color2"),
        percentageText = that.find(".percentage"),
        percentage = percentageText.data("percentage"),
        degrees = percentage * 3.6;

    circleBorder.css({
        "background-color": animationColor,
    });

    setTimeout(function () {
        loopIt();
    }, 1);

    function loopIt() {
        i = i + 1;

        if (i < 0) {
            i = 0;
        }

        if (i > degrees) {
            i = degrees;
        }

        percentage = Math.round(i / 3.6);
        percentageText.text(percentage + "%");
        if (i <= 180) {
            circleBorder.css(
                "background-image",
                "linear-gradient(" +
                    (90 + i) +
                    "deg, transparent 50%," +
                    borderColor +
                    " 50%),linear-gradient(90deg, " +
                    borderColor +
                    " 50%, transparent 50%)"
            );
        } else {
            circleBorder.css(
                "background-image",
                "linear-gradient(" +
                    (i - 90) +
                    "deg, transparent 50%," +
                    animationColor +
                    " 50%),linear-gradient(90deg, " +
                    borderColor +
                    " 50%, transparent 50%)"
            );
        }

        setTimeout(function () {
            loopIt();
        }, 1);
    }
});

//  Initialize the DataTable
$(".days-away").ready(function () {
    $("#daysAway").DataTable();
});

$("#daysAway").DataTable({
    paging: true,
    searching: true,
    ordering: true,
    info: true,
    columnDefs: [
        // Customize specific columns
        { targets: [0], orderable: false },
    ],
});

//Select 2
$(document).ready(function () {
    // Initialize Select2
    $("#leaveType").select2();
});
