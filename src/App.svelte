<script>
  import Peaks from 'peaks.js';
  import { onMount } from "svelte";
  import { db } from './firebase.js';

  let peaksInstance;
  let segments = [];
  let selectedSegmentId;
  let rowSelected = false;
  let segmentPrevMax = 0;

  // After Svelte has created the webpage, initialize the peaks.js waveform player and all of its event-handlers. Also make sure the segments variable gets updated whenever a user manipulates the waveform player
  onMount(() => {
    const options = {
      container: document.getElementById('waveform-container'),
      mediaElement: document.getElementById('audio'),
      webAudio: {
        audioContext: new AudioContext()
      },
      keyboard: false,
      pointMarkerColor: '#006eb0',
      showPlayheadTime: true,
      inMarkerColor: '#999999',
      outMarkerColor: '#3d3d3d',

    };
    // Initialize peaks.js UI
    peaksInstance = Peaks.init(options, function (err, peakrs) {
      console.log("Peaks instance ready");
      segments = peaksInstance.segments.getSegments();
    });
    // Add some built-in event handlers for mouse events for segments
    peaksInstance.on('segments.mouseleave', function (segment) {
      segments = peaksInstance.segments.getSegments();
    });
    peaksInstance.on('segments.click', function (segment) {
      segments = peaksInstance.segments.getSegments();
    });
    peaksInstance.on('segments.dragged', function (segment) {
      segments = peaksInstance.segments.getSegments();
    });
  });

  // AWS
  function testAWS() {
    AWS.config.getCredentials((err) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log("Access key: ", AWS.config.credentials.accessKeyId);
        console.log("Secret access key: ", AWS.config.credentials.secretAccessKey);
      }
    });
  }
  // Grab the start and end time for each thought and save them into firebase
  function finish() {
    if (segments) {
      if (segments.length < 2) {
        alert("Please tag a few more thoughts");
      }
      else {
        // We have to strip-out the extra properties that segment objects have (e.g. like waveform color) because firebase doesn't like that. Plus we only care about start and end times
        let toSave = {};
        segments.forEach((obj) => {
          toSave[obj._id] = { startTime: obj._startTime, endTime: obj._endTime };
        });
        db.collection('thoughts').doc('test-user').set(Object.assign({}, toSave))
          .then(() => {
            console.log("document added successfully");
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }

  // Store a new segment on button click
  function addSegment() {
    peaksInstance.segments.add({
      startTime: peaksInstance.player.getCurrentTime(),
      endTime: peaksInstance.player.getCurrentTime() + 5,
      labelText: "Thought " + segmentPrevMax.toString(),
      editable: true
    });
    // Update the variable that stores all the segments for dynamic rendering
    segments = peaksInstance.segments.getSegments();
    segmentPrevMax = segmentPrevMax + 1;
  }

  // Select a segment based on a table row that get clicked 
  function selectSegment(ev) {
    // Get all rows
    let rows = document.getElementsByClassName("table-row");
    // Get click row
    let row = ev.target.parentNode;
    // If clicked row already has class unselected it and all other rows
    if (row.className === 'table-row is-selected') {
      for (let r of rows) {
        r.className = 'table-row';
      }
      rowSelected = false;
    }
    // Otherwise unselect everything else first then select this one
    else {
      for (let r of rows) {
        r.className = 'table-row';
      }
      row.className += " is-selected";
      rowSelected = true;
    }
    // Save the segment id
    selectedSegmentId = parseInt(row.querySelector("td.segment-id").innerText);
    selectedSegmentId = "peaks.segment." + selectedSegmentId.toString();
  }

  // Play a selected segment on button click
  function playSegment() {
    let segment = peaksInstance.segments.getSegment(selectedSegmentId);
    peaksInstance.player.playSegment(segment);
  }

  // Delete a selected segment on button click
  function deleteSegment() {
    peaksInstance.segments.removeById(selectedSegmentId);
    // Clear selection from all other rows and hide button
    let rows = document.getElementsByClassName("table-row");
    for (let r of rows) {
      r.className = 'table-row';
    }
    rowSelected = false;
    segments = peaksInstance.segments.getSegments();
  }

  // Print all segments to console on button click; just for debugging
  function seeSegments() {
    console.log(segments);
  }
</script>

<style>
  .hidden {
    visibility: hidden;
  }

  .table {
    margin-left: auto;
    margin-right: auto;
  }
</style>
<section class="section">
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-three-quarters">
        <h1 class='title'>Thought Segmentation</h1>
        <p class="is-size-5">
          In this task, you will listen to a series of audio files (~2 min) in which you will hear people describing
          characters from a television drama. The goal of this task is to divide the audio into separate speech segments
          or thoughts. Follow the directions below to perform the task. <b>Do not refresh your browser</b>
        </p>
        <div class="columns">
          <div class="column is-10 is-offset-1">
            <ol>
              <li>Click the play button
                to start listening to the audio. </li>
              <li>Pay close attention to where there are natural breaks in a person’s speech, demarcating a separate
                thought.
              </li>
              <li>Click Tag Thought, to tag a speech segment or “thought”. You can adjust the start and end times by
                dragging the sliders. Add segments as you continue to listen to the audio. </li>
              <li>You can go back and edit segments by clicking on then in the table.</li>
              <li>Click Finish to continue to the next audio file. </li>
            </ol>
          </div>
        </div>
        <div id="waveform-container"></div>
        <div class="columns">
          <div class="column is-one-quarter">
            <audio id="audio" controls="controls">
              <source src="https://dl.dropboxusercontent.com/s/vvq50nz47pndx2b/s12_JulieTaylor.wav" type="audio/wav">
              Your browser does not support the audio element.
            </audio>
          </div>
          <div class="column is-one-half">
            <button class="button is-primary is-large" on:click={addSegment}>Tag Thought</button>
            <button class="button is-info is-large" on:click={finish}>Finished</button>
            <button class="{rowSelected ? 'button is-success is-large' : 'button is-success is-large hidden'}"
              on:click={playSegment}>Play
              Thought</button>
            <button class="{rowSelected ? 'button is-danger is-large' : 'button is-danger is-large hidden'}"
              on:click={deleteSegment}>Delete
              Segment</button>
            <!-- <button class="button is-warning is-large" on:click={seeSegments}>Debug</button> -->
          </div>
        </div>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-three-quarters has-text-centered">
        {#if segments && segments.length}
        <div class="table-container">
          <table class="table is-hoverable">
            <thead>
              <tr>
                <th>Thought Number</th>
                <th>Start time</th>
                <th>End time</th>
              </tr>
            </thead>
            <tbody>
              {#each segments as segment, i (segment.id)}
                <tr on:click={selectSegment} class='table-row'> 
                  <td type="text" class="segment-id">{segment.id.split('.').slice(-1)[0]}</td>
                  <td type="number">{(segment.startTime).toFixed(2)}</td> 
                  <td type="number">{(segment.endTime).toFixed(2)}</td> 
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        {:else}
          <h2 class="title is-4">No Thoughts Tagged</h2>
        {/if}
      </div>
    </div>
  </div>
</section>