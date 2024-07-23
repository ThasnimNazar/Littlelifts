import React from 'react';
import { useEffect } from 'react';
import './Css/Admin/Sitter/Slider.css'
import $ from 'jquery';
import 'bootstrap';

const Productslider = () => {

    useEffect(() => {
        $(document).ready(function () {
          $('#itemslider').carousel({ interval: 3000 });
    
          $('.carousel-showmanymoveone .item').each(function () {
            let itemToClone = $(this);
    
            for (let i = 1; i < 6; i++) {
              itemToClone = itemToClone.next();
    
              if (!itemToClone.length) {
                itemToClone = $(this).siblings(':first');
              }
    
              itemToClone.children(':first-child')
                .clone()
                .addClass("cloneditem-" + (i))
                .appendTo($(this));
            }
          });
        });
      }, []);
  return (
    <div>
      {/* Latest compiled and minified CSS */}
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
        crossorigin="anonymous"
      />

      {/* Optional theme */}
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css"
        integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp"
        crossorigin="anonymous"
      />

      {/* Latest compiled and minified JavaScript */}
      <script
        src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
        integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
        crossorigin="anonymous"
      ></script>
      <link
        href="https://fonts.googleapis.com/css?family=Josefin+Sans:300,400,700&subset=latin-ext"
        rel="stylesheet"
      />

      {/* Item slider text */}
      <h1 className="text-center">Product Slider</h1>
      <ul>
        <li>Auto Slide</li>
        <li>Stop On Hover</li>
        <li>Slide One Item</li>
      </ul>
      <div className="container">
        <div className="row" id="slider-text">
          <div className="col-md-6">
            <h2>NEW COLLECTION</h2>
          </div>
        </div>
      </div>

      {/* Item slider */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs-12 col-sm-12 col-md-12">
            <div className="carousel carousel-showmanymoveone slide" id="itemslider">
              <div className="carousel-inner">
                <div className="item active">
                  <div className="col-xs-12 col-sm-6 col-md-2">
                    <a href="#">
                      <img
                        src="https://images.unsplash.com/photo-1539840093138-9b3e230e5206?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=765a2eb222b1851840a4a157780fb487&auto=format&fit=crop&w=1534&q=80"
                        className="img-responsive center-block"
                      />
                    </a>
                    <h4 className="text-center">MAYORAL SUKNJA</h4>
                    <h5 className="text-center">200,00 TK</h5>
                  </div>
                </div>

                <div className="item">
                  <div className="col-xs-12 col-sm-6 col-md-2">
                    <a href="#">
                      <img
                        src="https://images.unsplash.com/photo-1524010349062-860def6649c3?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=e725946a3f177dce83a705d4b12019c2&auto=format&fit=crop&w=500&q=60"
                        className="img-responsive center-block"
                      />
                    </a>
                    <h4 className="text-center">MAYORAL KOŠULJA</h4>
                    <h5 className="text-center">800 TK</h5>
                  </div>
                </div>

                <div className="item">
                  <div className="col-xs-12 col-sm-6 col-md-2">
                    <a href="#">
                      <img
                        src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=04aebe9a22884efa1a5f61e434215597&auto=format&fit=crop&w=500&q=60"
                        className="img-responsive center-block"
                      />
                    </a>
                    <span className="badge">10%</span>
                    <h4 className="text-center">PANTALONE TERI 2</h4>
                    <h5 className="text-center">4000,00 TK</h5>
                    <h6 className="text-center">5000,00 TK</h6>
                  </div>
                </div>

                <div className="item">
                  <div className="col-xs-12 col-sm-6 col-md-2">
                    <a href="#">
                      <img
                        src="https://images.unsplash.com/photo-1531925470851-1b5896b67dcd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=91fe0ca1b5d72338a8aac04935b52148&auto=format&fit=crop&w=500&q=60"
                        className="img-responsive center-block"
                      />
                    </a>
                    <h4 className="text-center">CVETNA HALJINA</h4>
                    <h5 className="text-center">4000,00 RSD</h5>
                  </div>
                </div>

                <div className="item">
                  <div className="col-xs-12 col-sm-6 col-md-2">
                    <a href="#">
                      <img
                        src="https://images.unsplash.com/photo-1516961642265-531546e84af2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=74065eec3c2f6a8284bbe30402432f1d&auto=format&fit=crop&w=500&q=60"
                        className="img-responsive center-block"
                      />
                    </a>
                    <h4 className="text-center">MAJICA FOTO</h4>
                    <h5 className="text-center">40,00 TK</h5>
                  </div>
                </div>

                <div className="item">
                  <div className="col-xs-12 col-sm-6 col-md-2">
                    <a href="#">
                      <img
                        src="https://images.unsplash.com/photo-1532086853747-99450c17fa2e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=61a42a11f627b0d21d0df757d9b8fe23&auto=format&fit=crop&w=500&q=60"
                        className="img-responsive center-block"
                      />
                    </a>
                    <h4 className="text-center">MAJICA MAYORAL</h4>
                    <h5 className="text-center">100,00 TK</h5>
                  </div>
                </div>
              </div>

              <div id="slider-control">
                <a className="left carousel-control" href="#itemslider" data-slide="prev">
                  <img
                    src="https://cdn0.iconfinder.com/data/icons/website-kit-2/512/icon_402-512.png"
                    alt="Left"
                    className="img-responsive"
                  />
                </a>
                <a className="right carousel-control" href="#itemslider" data-slide="next">
                  <img
                    src="http://pixsector.com/cache/81183b13/avcc910c4ee5888b858fe.png"
                    alt="Right"
                    className="img-responsive"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Item slider end */}
      <br />
      <br />
      <footer className="bg-info">
        <p className="text-center">
          &copy; <a href="https://marufcse.com" target="_blank">Maruf-Al Bashir 2024</a>
        </p>
      </footer>
    </div>
  );
};

export default Productslider;
